import assert from 'node:assert/strict';
import test from 'node:test';
import { getViewerReader } from '../src/application/reader/viewer-reader-service';
import type { PublicReaderPublicationRecord, PublicReaderRepository } from '../src/application/reader/public-reader-types';
import { createViewerRolloutConfig } from '../src/application/reader/viewer-rollout';

const page = {
  generationId: 'generation-1',
  pageNumber: 1,
  imageUrl: 'https://assets.example/page-1.webp',
  width: 100,
  height: 150,
};

test('returns only the canonical, access-filtered reader data for a historical slug', async () => {
  const result = await getViewerReader(repository({ slug: 'canonical-zine' }), 'old-zine', config({
    READER_BETA_SLUGS: 'canonical-zine',
  }), 'embed');

  assert.equal(result.status, 'available');
  if (result.status !== 'available') return;
  assert.equal(result.reader.status, 'ready');
  if (result.reader.status !== 'ready') return;
  assert.equal(result.reader.publication.slug, 'canonical-zine');
  assert.equal('activePageGeneration' in result.reader, false);
});

test('returns a serialized PDF fallback for an incomplete generation', async () => {
  const result = await getViewerReader(repository({
    activePageGeneration: 'generation-1',
    pages: [],
    totalPages: 1,
  }), 'zine', config({ READER_BETA_SLUGS: 'zine' }), 'embed');

  assert.deepEqual(result, {
    reader: {
      fallback: { label: 'Abrir o PDF original', url: 'https://assets.example/zine.pdf' },
      publication: { id: 42, slug: 'zine', title: 'Test zine' },
      reason: 'incomplete-page-generation',
      status: 'fallback',
    },
    status: 'available',
  });
});

test('does not expose a reader when the publication slug is unknown', async () => {
  const result = await getViewerReader(repository(null), 'missing-zine', config({
    READER_BETA_SLUGS: 'missing-zine',
  }), 'reader');

  assert.deepEqual(result, { status: 'not-found' });
});

test('does not expose a publication when the surface rollout is disabled', async () => {
  const result = await getViewerReader(repository(), 'zine', config({
    READER_EMBED_ENABLED: 'false',
    READER_BETA_SLUGS: 'zine',
  }), 'embed');

  assert.deepEqual(result, { status: 'unavailable' });
});

test('requires the beta token only for the embed surface', async () => {
  const rollout = config({
    READER_BETA_ALLOW_ALL: 'true',
    READER_BETA_TOKENS: 'tester-1',
    READER_VIEWER_ENABLED: 'true',
  });

  assert.equal((await getViewerReader(repository(), 'zine', rollout, 'reader')).status, 'available');
  assert.equal((await getViewerReader(repository(), 'zine', rollout, 'embed')).status, 'unavailable');
  assert.equal((await getViewerReader(repository(), 'zine', rollout, 'embed', 'tester-1')).status, 'available');
});

function config(overrides: Record<string, string>) {
  return createViewerRolloutConfig({
    READER_BETA_ENABLED: 'true',
    READER_EMBED_ENABLED: 'true',
    ...overrides,
  });
}

function repository(overrides: Partial<PublicReaderPublicationRecord> | null = {}): PublicReaderRepository {
  return {
    findPublicBySlug: async () => overrides === null ? null : ({
      activePageGeneration: 'generation-1',
      id: 42,
      importStatus: 'completed',
      pages: [page],
      pdfUrl: 'https://assets.example/zine.pdf',
      slug: 'zine',
      title: 'Test zine',
      totalPages: 1,
      ...overrides,
    }),
  };
}
