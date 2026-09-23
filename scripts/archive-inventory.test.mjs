import { mkdtemp, mkdir, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildManifest,
  compareManifests,
  createSupabaseSnapshot,
  assertSafeOutputDirectory,
  runInventory,
  scanArchive,
  selectDeterministicSample,
} from './archive-inventory.mjs';

const tempDirs = [];

test.after(async () => {
  await Promise.all(tempDirs.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function makeTempDir() {
  const directory = await mkdtemp(path.join(tmpdir(), 'biblioteca-inventory-'));
  tempDirs.push(directory);
  return directory;
}

test('captures every configured Supabase table through read-only GET pages', async () => {
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url: String(url), method: init?.method ?? 'GET' });
    const parsed = new URL(url);
    const table = parsed.pathname.split('/').pop();
    const offset = Number(parsed.searchParams.get('offset'));
    const rows = table === 'library_zines' && offset === 0
      ? [{ id: 1, slug: 'first' }, { id: 2, slug: 'second' }]
      : table === 'library_zines' ? [] : [{ id: 7 }];
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const snapshot = await createSupabaseSnapshot({
    baseUrl: 'https://supabase.example.test',
    apiKey: 'test-key',
    tableNames: ['library_zines', 'authors'],
    pageSize: 2,
    runId: 'run-1',
    collectedAt: '2026-09-23T00:00:00.000Z',
    fetchImpl,
  });

  assert.deepEqual(snapshot.tables.library_zines, [{ id: 1, slug: 'first' }, { id: 2, slug: 'second' }]);
  assert.deepEqual(snapshot.tables.authors, [{ id: 7 }]);
  assert.equal(requests.every(({ method }) => method === 'GET'), true);
  assert.equal(requests.every(({ url }) => url.includes('select=*')), true);
  assert.equal(snapshot.provenance.runId, 'run-1');
});

test('preserves a table error without discarding other snapshot tables', async () => {
  const fetchImpl = async (url) => {
    const table = new URL(url).pathname.split('/').pop();
    if (table === 'form_uploads') return new Response('denied', { status: 403 });
    return new Response(JSON.stringify([{ id: 1 }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const snapshot = await createSupabaseSnapshot({
    baseUrl: 'https://supabase.example.test',
    apiKey: 'test-key',
    tableNames: ['library_zines', 'form_uploads'],
    fetchImpl,
  });

  assert.deepEqual(snapshot.tables.library_zines, [{ id: 1 }]);
  assert.equal(snapshot.tables.form_uploads, undefined);
  assert.match(snapshot.tableErrors.form_uploads.error, /HTTP 403/);
});

test('scans files without modifying them and records checksums and validation', async () => {
  const archiveDirectory = await makeTempDir();
  await mkdir(path.join(archiveDirectory, 'nested'));
  const pdf = Buffer.from('%PDF-1.7 fixture');
  await writeFile(path.join(archiveDirectory, 'first.pdf'), pdf);
  await writeFile(path.join(archiveDirectory, 'nested', 'notes.txt'), 'not a pdf');

  const manifest = await scanArchive({
    archiveDirectory,
    classifyFile: async ({ relativePath, buffer }) => ({
      mimeType: relativePath.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
      pdf: relativePath.endsWith('.pdf')
        ? { status: 'valid', pageCount: 1 }
        : { status: 'not-applicable' },
      bytesUnchanged: buffer.length > 0,
    }),
  });

  assert.equal(manifest.files.length, 2);
  assert.equal(manifest.files[0].relativePath, 'first.pdf');
  assert.equal(manifest.files[0].sha256, '326f08384935076431efafc84c9ee42b1a4b7b706671956f780d39ceb83e0116');
  assert.equal(manifest.files[0].pdf.status, 'valid');
  assert.equal(manifest.files[1].relativePath, 'nested/notes.txt');
});

test('matches by persisted slug before recording secondary evidence', () => {
  const result = buildManifest({
    snapshot: {
      tables: {
        library_zines: [
          { id: 1, slug: 'first-zine', title: 'First Zine', pdf_url: 'https://example.test/first.pdf' },
          { id: 2, slug: 'missing-zine', title: 'Possible First', pdf_url: null },
          { id: 3, slug: 'another-missing-zine', title: 'Possible First', pdf_url: null },
        ],
      },
    },
    files: [
      { relativePath: 'first-zine.pdf', sha256: 'a', size: 10, pdf: { status: 'valid' } },
      { relativePath: 'possible-first.pdf', sha256: 'b', size: 12, pdf: { status: 'valid' } },
    ],
  });

  assert.equal(result.files[0].match.status, 'matched');
  assert.equal(result.files[0].match.method, 'slug');
  assert.equal(result.files[1].match.status, 'ambiguous');
  assert.equal(result.records.find((record) => record.id === 2).status, 'missing');
});

test('keeps known failures without making network requests', () => {
  const result = buildManifest({
    snapshot: { tables: { library_zines: [{ id: 1, slug: 'broken-zine', title: 'Broken Zine', pdf_url: 'https://drive.test/broken' }] } },
    files: [],
    knownFailures: [{ slug: 'broken-zine', cause: 'drive-restricted', observedAt: '2026-09-22' }],
  });

  assert.deepEqual(result.knownFailures, [{
    slug: 'broken-zine',
    cause: 'drive-restricted',
    observedAt: '2026-09-22',
  }]);
  assert.equal(result.records[0].status, 'known-failure');
});

test('compares stable manifest content while ignoring run provenance', () => {
  const before = {
    schemaVersion: 1,
    provenance: { runId: 'old', collectedAt: 'old' },
    files: [
      { relativePath: 'same.pdf', sha256: 'same', match: { status: 'matched' } },
      { relativePath: 'removed.pdf', sha256: 'old', match: { status: 'matched' } },
    ],
    records: [{ id: 1, status: 'matched' }],
  };
  const after = {
    schemaVersion: 1,
    provenance: { runId: 'new', collectedAt: 'new' },
    files: [
      { relativePath: 'same.pdf', sha256: 'changed', match: { status: 'ambiguous' } },
      { relativePath: 'added.pdf', sha256: 'new', match: { status: 'matched' } },
    ],
    records: [{ id: 1, status: 'ambiguous' }],
  };

  assert.deepEqual(compareManifests(before, after), {
    files: { added: ['added.pdf'], removed: ['removed.pdf'], changed: ['same.pdf'], unchanged: [] },
    records: { changed: [{ id: 1, from: 'matched', to: 'ambiguous' }], unchanged: [] },
  });
});

test('keeps an unreadable file as an invalid observation and continues', async () => {
  const archiveDirectory = await makeTempDir();
  await writeFile(path.join(archiveDirectory, 'good.pdf'), 'good');
  await writeFile(path.join(archiveDirectory, 'unreadable.pdf'), 'secret');

  const manifest = await scanArchive({
    archiveDirectory,
    readFileImpl: async (filePath) => {
      if (filePath.endsWith('unreadable.pdf')) throw new Error('permission denied');
      return Buffer.from('good');
    },
    classifyFile: async () => ({ mimeType: 'application/pdf', pdf: { status: 'valid', pageCount: 1 } }),
  });

  assert.equal(manifest.files.length, 2);
  assert.equal(manifest.files.find((file) => file.relativePath === 'unreadable.pdf').status, 'invalid');
  assert.equal(manifest.files.find((file) => file.relativePath === 'good.pdf').pdf.status, 'valid');
});

test('rejects comparisons across unsupported manifest schemas', () => {
  assert.throws(
    () => compareManifests({ schemaVersion: 1, files: [], records: [] }, { schemaVersion: 2, files: [], records: [] }),
    /Unsupported manifest schema comparison/,
  );
});

test('rejects repository output unless explicitly allowed', () => {
  assert.throws(
    () => assertSafeOutputDirectory('/workspace/repo/inventory', { repositoryRoot: '/workspace/repo' }),
    /must be outside the repository/,
  );
  assert.doesNotThrow(() => assertSafeOutputDirectory('/tmp/inventory', { repositoryRoot: '/workspace/repo' }));
  assert.doesNotThrow(() => assertSafeOutputDirectory('/workspace/repo/inventory', {
    repositoryRoot: '/workspace/repo',
    allowRepositoryOutput: true,
  }));
});

test('runs the complete inventory seam and writes private derived outputs', async () => {
  const archiveDirectory = await makeTempDir();
  const outputDirectory = await makeTempDir();
  await writeFile(path.join(archiveDirectory, 'first.pdf'), '%PDF fixture');

  const result = await runInventory({
    archiveDirectory,
    outputDirectory,
    baseUrl: 'https://supabase.example.test',
    apiKey: 'test-key',
    tableNames: ['library_zines'],
    fetchImpl: async () => new Response(JSON.stringify([
      { id: 1, slug: 'first', title: 'First', pdf_url: null },
    ]), { status: 200 }),
    classifyFile: async () => ({
      mimeType: 'application/pdf',
      pdf: { status: 'valid', pageCount: 1 },
    }),
    runId: 'run-seam',
    collectedAt: '2026-09-23T00:00:00.000Z',
    repositoryRoot: '/workspace/repo',
  });

  assert.equal(result.manifest.records[0].status, 'matched');
  assert.equal(result.manifest.provenance.runId, 'run-seam');
  assert.equal(result.comparison, null);
  assert.equal((await readdir(outputDirectory)).sort().join(','), 'manifest.json,report.md,supabase-snapshot.json');
});

test('selects a stable sample from risk categories', () => {
  const manifest = {
    files: [
      { relativePath: 'z.pdf', match: { status: 'unmatched-file' }, pdf: { status: 'valid' } },
      { relativePath: 'a.pdf', match: { status: 'ambiguous' }, pdf: { status: 'valid' } },
      { relativePath: 'broken.pdf', match: { status: 'matched' }, pdf: { status: 'invalid' } },
    ],
    records: [
      { id: 2, status: 'unmatched-record' },
      { id: 1, status: 'known-failure' },
    ],
  };

  assert.deepEqual(selectDeterministicSample(manifest, { limitPerCategory: 1 }), {
    files: {
      ambiguous: ['a.pdf'],
      'invalid-pdf': ['broken.pdf'],
      'unmatched-file': ['z.pdf'],
    },
    records: {
      'known-failure': [1],
      'unmatched-record': [2],
    },
  });
});
