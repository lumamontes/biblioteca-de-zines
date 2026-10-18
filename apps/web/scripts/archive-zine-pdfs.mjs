#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import slugify from 'slugify';

const tables = ['library_zines'];

export function slugForZine(row) {
  if (typeof row.slug === 'string' && row.slug) return row.slug;
  return slugify(row.title, { lower: true, strict: true });
}

export function driveDownloadUrl(pdfUrl) {
  const url = new URL(pdfUrl);
  if (url.hostname.toLowerCase() !== 'drive.google.com') return url;

  const fileMatch = url.pathname.match(/^\/file\/d\/([^/]+)/);
  const id =
    fileMatch?.[1] ??
    (url.pathname === '/open' || url.pathname === '/uc'
      ? url.searchParams.get('id')
      : null);
  if (!id) return url;

  const resourceKey =
    url.searchParams.get('resourcekey') ?? url.searchParams.get('resourceKey');
  const downloadUrl = new URL('https://drive.google.com/uc');
  downloadUrl.searchParams.set('export', 'download');
  downloadUrl.searchParams.set('id', id);
  if (resourceKey) downloadUrl.searchParams.set('resourcekey', resourceKey);
  return downloadUrl;
}

async function fetchPublishedZines({ baseUrl, apiKey, fetchImpl }) {
  const resources = [];
  for (const table of tables) {
    const url = new URL(`/rest/v1/${table}`, baseUrl);
    url.search = new URLSearchParams({
      select: 'id,title,pdf_url,slug',
      is_published: 'eq.true',
      pdf_url: 'not.is.null',
      order: 'id.asc',
    }).toString();
    const response = await fetchImpl(url, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Supabase ${table} request failed: HTTP ${response.status}`);
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error(`Supabase ${table} response was not an array`);
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      if (typeof row.pdf_url !== 'string' || !row.pdf_url) continue;
      if (typeof row.title !== 'string' || !row.title) continue;
      resources.push({
        id: row.id,
        title: row.title,
        pdfUrl: row.pdf_url,
        slug: typeof row.slug === 'string' ? row.slug : null,
      });
    }
  }
  return resources;
}

// Google Drive serves an HTML "can't scan this file for viruses" interstitial
// instead of the file itself once a download exceeds its scan size threshold.
// The interstitial links to the same file with a `confirm` token appended.
async function downloadFollowingConfirm(url, fetchImpl) {
  let response = await fetchImpl(url);
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/html')) {
    const body = await response.text();
    const confirmMatch = body.match(/confirm=([0-9A-Za-z_-]+)/);
    if (!confirmMatch) {
      throw new Error('Drive returned an HTML page instead of a file');
    }
    const retryUrl = new URL(url);
    retryUrl.searchParams.set('confirm', confirmMatch[1]);
    response = await fetchImpl(retryUrl);
  }
  return response;
}

async function archiveZine(zine, outputDir, fetchImpl) {
  const filename = `${slugForZine(zine)}.pdf`;
  const downloadUrl = driveDownloadUrl(zine.pdfUrl);
  const response = await downloadFollowingConfirm(downloadUrl, fetchImpl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} downloading ${zine.pdfUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(outputDir, filename), buffer);
  return filename;
}

export async function archivePublishedZines({
  baseUrl,
  apiKey,
  outputDir,
  fetchImpl = fetch,
  log = () => {},
}) {
  await mkdir(outputDir, { recursive: true });
  const zines = await fetchPublishedZines({ baseUrl, apiKey, fetchImpl });
  const downloaded = [];
  const failed = [];
  for (const zine of zines) {
    try {
      const filename = await archiveZine(zine, outputDir, fetchImpl);
      downloaded.push(filename);
      log(`downloaded ${filename}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({ id: zine.id, title: zine.title, error: message });
      log(`failed "${zine.title}": ${message}`);
    }
  }
  return { downloaded, failed };
}

async function main() {
  // NEXT_PUBLIC_SUPABASE_* matches .env/env.example; SUPABASE_* matches the
  // names resource-monitor.yml maps its secrets to.
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  // Defaults to the repo-root `archive/` folder, which .gitignore excludes;
  // pass an explicit output dir only if it is also git-ignored.
  const outputDir = process.argv[2] ?? 'archive';
  if (!baseUrl || !apiKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY) are required',
    );
  }

  const { downloaded, failed } = await archivePublishedZines({
    baseUrl,
    apiKey,
    outputDir,
    log: (line) => process.stdout.write(`${line}\n`),
  });
  process.stderr.write(`\n${downloaded.length} downloaded, ${failed.length} failed\n`);
  if (failed.length > 0) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  });
}
