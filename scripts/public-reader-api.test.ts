import assert from 'node:assert/strict';
import test from 'node:test';
import { serializePublicReaderResult } from '../src/application/reader/public-reader-api';

test('serializes a ready reader without adding access or persistence controls', () => {
  const result = serializePublicReaderResult({
    fallback: { label: 'Open PDF', url: '/zine.pdf' },
    manifest: {
      generationId: 'generation-1',
      pageCount: 1,
      pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: '/page.webp', width: 100, height: 150 }],
    },
    publication: { id: 42, slug: 'test-zine', title: 'Test Zine' },
    status: 'ready',
  });

  assert.deepEqual(result, {
    fallback: { label: 'Open PDF', url: '/zine.pdf' },
    manifest: {
      generationId: 'generation-1',
      pageCount: 1,
      pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: '/page.webp', width: 100, height: 150 }],
    },
    publication: { id: 42, slug: 'test-zine', title: 'Test Zine' },
    status: 'ready',
  });
});

test('preserves an explicit fallback response', () => {
  assert.deepEqual(serializePublicReaderResult({
    fallback: { label: 'Open PDF', url: '/zine.pdf' },
    reason: 'page-generation-unavailable',
    status: 'fallback',
  }), {
    fallback: { label: 'Open PDF', url: '/zine.pdf' },
    reason: 'page-generation-unavailable',
    status: 'fallback',
  });
});
