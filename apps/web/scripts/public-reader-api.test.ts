import assert from 'node:assert/strict';
import test from 'node:test';
import { serializePublicReaderResult } from '@/application/reader/public-reader-api';

test('serializes only reader-safe ready and fallback fields', () => {
  const result = serializePublicReaderResult({
    status: 'ready',
    publication: { id: 1, slug: 'zine', title: 'Zine' },
    manifest: { generationId: 'g1', pageCount: 1, pages: [{ generationId: 'g1', pageNumber: 1, imageUrl: '/page.webp', width: 100, height: 150 }] },
    fallback: { label: 'Open PDF', url: '/zine.pdf' },
  });
  assert.deepEqual(result.publication, { id: 1, slug: 'zine', title: 'Zine' });
  assert.equal('importStatus' in result, false);
});
