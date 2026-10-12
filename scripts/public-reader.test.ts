import assert from 'node:assert/strict';
import test from 'node:test';
import { getPublicReaderPublication } from '../src/application/reader/public-reader-service';
import type {
  PublicReaderPublicationRecord,
  PublicReaderRepository,
} from '../src/application/reader/public-reader-types';

const page = {
  generationId: 'generation-1',
  pageNumber: 1,
  imageUrl: 'https://assets.example/zines/42/generations/generation-1/page-1.png',
  width: 1200,
  height: 1800,
};

test('returns the validated active generation for a public publication', async () => {
  const result = await getPublicReaderPublication(repository({
    activePageGeneration: 'generation-1',
    importStatus: 'completed',
    pages: [page],
    totalPages: 1,
  }), 'test-zine');

  assert.equal(result?.status, 'ready');
  if (result?.status !== 'ready') return;
  assert.equal(result.manifest.generationId, 'generation-1');
  assert.deepEqual(result.manifest.pages, [page]);
  assert.equal(result.fallback.url, 'https://drive.example/zine.pdf');
});

test('returns the PDF fallback when the publication has no active generation', async () => {
  const result = await getPublicReaderPublication(repository({
    activePageGeneration: 'legacy',
    importStatus: 'pending',
    pages: [],
    totalPages: 0,
  }), 'test-zine');

  assert.deepEqual(result, {
    fallback: {
      label: 'Abrir o PDF original',
      url: 'https://drive.example/zine.pdf',
    },
    reason: 'page-generation-unavailable',
    status: 'fallback',
  });
});

test('returns a visible failure state for an incomplete or failed generation', async () => {
  const incomplete = await getPublicReaderPublication(repository({
    activePageGeneration: 'generation-1',
    importStatus: 'completed',
    pages: [],
    totalPages: 1,
  }), 'test-zine');
  assert.equal(incomplete?.status, 'fallback');
  assert.equal(incomplete?.reason, 'incomplete-page-generation');

  const failed = await getPublicReaderPublication(repository({
    activePageGeneration: 'legacy',
    importStatus: 'failed',
    pages: [],
    totalPages: 0,
  }), 'test-zine');
  assert.equal(failed?.status, 'fallback');
  assert.equal(failed?.reason, 'page-generation-failed');
});

test('does not expose withdrawn publications', async () => {
  const result = await getPublicReaderPublication({
    findPublicBySlug: async () => null,
  }, 'withdrawn-zine');

  assert.equal(result, null);
});

function repository(overrides: Partial<PublicReaderPublicationRecord>): PublicReaderRepository {
  return {
    findPublicBySlug: async () => ({
      activePageGeneration: 'legacy',
      id: 42,
      importStatus: 'pending',
      pages: [],
      pdfUrl: 'https://drive.example/zine.pdf',
      slug: 'test-zine',
      title: 'Test zine',
      totalPages: 0,
      ...overrides,
    }),
  };
}
