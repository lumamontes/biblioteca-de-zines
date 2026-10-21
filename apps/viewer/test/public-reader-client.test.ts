import assert from 'node:assert/strict';
import test from 'node:test';
import { createReaderRequestController, fetchPublicReader } from '@/infrastructure/public-reader-client';

const readyResponse = {
  status: 'ready',
  fallback: { label: 'PDF', url: '/zine.pdf' },
  publication: { id: 1, slug: 'zine', title: 'Zine' },
  manifest: {
    generationId: 'generation-1',
    pageCount: 1,
    pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets.test/page.webp', width: 100, height: 150 }],
  },
};

test('aborts a reader request after its timeout', async () => {
  const request = createReaderRequestController(1);
  try {
    await new Promise((resolve) => setTimeout(resolve, 5));
    assert.equal(request.signal.aborted, true);
  } finally {
    request.cancel();
  }
});

test('parses an available reader response and records its metadata size', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify(readyResponse), { headers: { 'content-length': '123' } });

  try {
    const result = await fetchPublicReader('https://reader.test', 'zine', 'standalone', new AbortController().signal);
    assert.equal(result.data.status, 'ready');
    assert.equal(result.metadataBytes, 123);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects a non-success HTTP response for the unavailable reader state', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 });

  try {
    await assert.rejects(fetchPublicReader('https://reader.test', 'zine', 'standalone', new AbortController().signal), /Reader API unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('propagates an aborted request so the controller can show unavailable and retry', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    assert.ok(init?.signal?.aborted);
    throw new DOMException('The operation was aborted.', 'AbortError');
  };
  const controller = new AbortController();
  controller.abort();

  try {
    await assert.rejects(fetchPublicReader('https://reader.test', 'zine', 'standalone', controller.signal), { name: 'AbortError' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects an invalid response instead of treating it as a usable reader', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ status: 'ready' }));

  try {
    await assert.rejects(fetchPublicReader('https://reader.test', 'zine', 'standalone', new AbortController().signal), /Invalid reader/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
