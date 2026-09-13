#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const tables = ['library_zines', 'form_uploads'];

export async function fetchMonitorResources({
  baseUrl,
  apiKey,
  fetchImpl = fetch,
  tableNames = tables,
}) {
  const resources = [];
  for (const table of tableNames) {
    const url = new URL(`/rest/v1/${table}`, baseUrl);
    url.search = new URLSearchParams({
      select: 'id,title,pdf_url',
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
      if (!row || typeof row !== 'object' || typeof row.pdf_url !== 'string') continue;
      resources.push({
        id: `${table}:${String(row.id)}`,
        url: row.pdf_url,
        ...(typeof row.title === 'string' && row.title
          ? { title: row.title }
          : {}),
      });
    }
  }
  return resources;
}

async function main() {
  const baseUrl = process.env.SUPABASE_URL;
  const apiKey = process.env.SUPABASE_ANON_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  }

  const resources = await fetchMonitorResources({ baseUrl, apiKey });
  const output = `${JSON.stringify(resources, null, 2)}\n`;
  const outputPath = process.argv[2];
  if (outputPath) await writeFile(outputPath, output, 'utf8');
  else process.stdout.write(output);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  });
}
