import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageManifest, InvalidPageManifestError } from '@/domain/reader/page-manifest';
import { getPublicReaderPublication } from '@/application/reader/public-reader-service';
import type { PublicReaderPublicationRecord, PublicReaderRepository } from '@/application/reader/public-reader-types';

const page = (number: number, generationId = 'generation-1') => ({ generationId, pageNumber: number, imageUrl: `/page-${number}.webp`, width: 100, height: 150 });

test('validates an ordered complete active generation', () => {
  assert.deepEqual(createPageManifest({ generationId: 'generation-1', pageCount: 2, pages: [page(1), page(2)] }).pages, [page(1), page(2)]);
  assert.throws(() => createPageManifest({ generationId: 'generation-1', pageCount: 2, pages: [page(1), { ...page(1, 'other'), width: 0 }] }), (error: unknown) => error instanceof InvalidPageManifestError && error.issues.includes('duplicate-page-number') && error.issues.includes('mixed-generation') && error.issues.includes('invalid-dimensions'));
});

test('returns ready, incomplete, failed, unavailable, and withdrawn states', async () => {
  const ready = await getPublicReaderPublication(repository({ activePageGeneration: 'generation-1', importStatus: 'completed', pages: [page(1)], totalPages: 1 }), 'zine');
  assert.equal(ready?.status, 'ready');
  const incomplete = await getPublicReaderPublication(repository({ activePageGeneration: 'generation-1', pages: [], totalPages: 1 }), 'zine');
  assert.equal(incomplete?.status, 'fallback');
  if (incomplete?.status === 'fallback') assert.equal(incomplete.reason, 'incomplete-page-generation');
  const failed = await getPublicReaderPublication(repository({ activePageGeneration: 'legacy', importStatus: 'failed' }), 'zine');
  if (failed?.status === 'fallback') assert.equal(failed.reason, 'page-generation-failed');
  const failedActiveGeneration = await getPublicReaderPublication(repository({ activePageGeneration: 'generation-1', importStatus: 'failed', pages: [page(1)], totalPages: 1 }), 'zine');
  if (failedActiveGeneration?.status === 'fallback') assert.equal(failedActiveGeneration.reason, 'page-generation-failed');
  const unavailable = await getPublicReaderPublication(repository({ activePageGeneration: null }), 'zine');
  if (unavailable?.status === 'fallback') assert.equal(unavailable.reason, 'page-generation-unavailable');
  assert.equal(await getPublicReaderPublication({ findPublicBySlug: async () => null }, 'withdrawn'), null);
});

function repository(overrides: Partial<PublicReaderPublicationRecord>): PublicReaderRepository {
  return { findPublicBySlug: async () => ({ id: 1, slug: 'zine', title: 'Zine', pdfUrl: 'https://example.test/zine.pdf', activePageGeneration: null, importStatus: 'pending', pages: [], totalPages: 0, ...overrides }) };
}
