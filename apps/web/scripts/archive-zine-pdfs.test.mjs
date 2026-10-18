import { createServer } from 'node:http';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  archivePublishedZines,
  driveDownloadUrl,
  slugForZine,
} from './archive-zine-pdfs.mjs';

const servers = [];
const tempDirs = [];

after(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise((resolve) => {
          server.close(resolve);
        }),
    ),
  );
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function makeTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), 'archive-zine-pdfs-'));
  tempDirs.push(dir);
  return dir;
}

// driveDownloadUrl() always points at drive.google.com, so tests redirect
// every request (Supabase and Drive alike) to the local mock server by path.
function localFetch(port) {
  return async (url, init) => {
    const target = new URL(String(url));
    target.protocol = 'http:';
    target.hostname = '127.0.0.1';
    target.port = String(port);
    return fetch(target, init);
  };
}

test('slugForZine prefers the stored slug over the title', () => {
  assert.equal(slugForZine({ title: 'A Zine', slug: 'custom-slug' }), 'custom-slug');
});

test('slugForZine falls back to a slugified title when slug is missing', () => {
  assert.equal(slugForZine({ title: 'Zine Número 2!', slug: null }), 'zine-numero-2');
});

test('driveDownloadUrl rewrites a Drive share link to a direct download URL', () => {
  const url = driveDownloadUrl('https://drive.google.com/file/d/abc123/view?resourcekey=xyz');
  assert.equal(url.origin + url.pathname, 'https://drive.google.com/uc');
  assert.equal(url.searchParams.get('export'), 'download');
  assert.equal(url.searchParams.get('id'), 'abc123');
  assert.equal(url.searchParams.get('resourcekey'), 'xyz');
});

test('driveDownloadUrl passes non-Drive URLs through unchanged', () => {
  const url = driveDownloadUrl('https://example.test/some.pdf');
  assert.equal(url.href, 'https://example.test/some.pdf');
});

test('downloads published zines to slug-named files', async () => {
  const server = createServer((request, response) => {
    if (request.url.includes('library_zines')) {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify([
          { id: 1, title: 'A Zine', slug: 'a-zine', pdf_url: 'https://drive.google.com/file/d/file1/view' },
          { id: 2, title: 'Zine Sem Slug', slug: null, pdf_url: 'https://drive.google.com/file/d/file2/view' },
        ]),
      );
      return;
    }
    if (request.url.includes('/uc')) {
      response.setHeader('content-type', 'application/pdf');
      response.end(Buffer.from('%PDF-1.4 fake'));
      return;
    }
    response.statusCode = 404;
    response.end();
  });
  servers.push(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const outputDir = await makeTempDir();

  const result = await archivePublishedZines({
    baseUrl,
    apiKey: 'test-key',
    outputDir,
    fetchImpl: localFetch(address.port),
  });

  assert.deepEqual(result, { downloaded: ['a-zine.pdf', 'zine-sem-slug.pdf'], failed: [] });
  const files = (await readdir(outputDir)).sort();
  assert.deepEqual(files, ['a-zine.pdf', 'zine-sem-slug.pdf']);
  const content = await readFile(path.join(outputDir, 'a-zine.pdf'), 'utf8');
  assert.equal(content, '%PDF-1.4 fake');
});

test('follows the Drive virus-scan confirmation interstitial', async () => {
  const server = createServer(async (request, response) => {
    if (request.url.includes('library_zines')) {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify([
          { id: 1, title: 'Big Zine', slug: 'big-zine', pdf_url: 'https://drive.google.com/file/d/big/view' },
        ]),
      );
      return;
    }
    if (request.url.includes('/uc')) {
      const url = new URL(request.url, 'http://127.0.0.1');
      if (!url.searchParams.get('confirm')) {
        response.setHeader('content-type', 'text/html');
        response.end('<html>confirm=abc123 to continue</html>');
        return;
      }
      response.setHeader('content-type', 'application/pdf');
      response.end(Buffer.from('%PDF-1.4 confirmed'));
      return;
    }
    response.statusCode = 404;
    response.end();
  });
  servers.push(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const outputDir = await makeTempDir();

  const result = await archivePublishedZines({
    baseUrl,
    apiKey: 'test-key',
    outputDir,
    fetchImpl: localFetch(address.port),
  });

  assert.deepEqual(result, { downloaded: ['big-zine.pdf'], failed: [] });
  const content = await readFile(path.join(outputDir, 'big-zine.pdf'), 'utf8');
  assert.equal(content, '%PDF-1.4 confirmed');
});

test('records a failure without aborting the rest of the run', async () => {
  const server = createServer((request, response) => {
    if (request.url.includes('library_zines')) {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify([
          { id: 1, title: 'Broken Zine', slug: 'broken-zine', pdf_url: 'https://drive.google.com/file/d/missing/view' },
          { id: 2, title: 'Fine Zine', slug: 'fine-zine', pdf_url: 'https://drive.google.com/file/d/ok/view' },
        ]),
      );
      return;
    }
    if (request.url.includes('id=missing')) {
      response.statusCode = 404;
      response.end('not found');
      return;
    }
    if (request.url.includes('/uc')) {
      response.setHeader('content-type', 'application/pdf');
      response.end(Buffer.from('%PDF-1.4 ok'));
      return;
    }
    response.statusCode = 404;
    response.end();
  });
  servers.push(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const outputDir = await makeTempDir();

  const result = await archivePublishedZines({
    baseUrl,
    apiKey: 'test-key',
    outputDir,
    fetchImpl: localFetch(address.port),
  });

  assert.deepEqual(result.downloaded, ['fine-zine.pdf']);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].title, 'Broken Zine');
  assert.match(result.failed[0].error, /HTTP 404/);
});
