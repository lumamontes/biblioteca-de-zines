import assert from 'node:assert/strict';
import test from 'node:test';
import { createZinePublicationModule } from '../src/application/publication/publication-module';
import { needsGeneratedCover, resolvePublishedCover } from '../src/application/publication/cover-publication-policy';
import type {
  PublicationRecord,
  PublicationRepository,
  PublicationUpload,
} from '../src/application/publication/zine-publication-types';

const pdfUrl = 'https://drive.google.com/file/d/test/view';

test('cover policy keeps a valid submitted cover', () => {
  assert.equal(resolvePublishedCover({
    submittedCoverImage: 'https://example.com/cover.jpg',
    currentCoverImage: 'https://assets.example/zines/1/covers/old.webp',
    currentZineId: 1,
    coverWasRemoved: false,
  }), 'https://example.com/cover.jpg');
});

test('cover policy removes a placeholder when the submission explicitly removes it', () => {
  assert.equal(resolvePublishedCover({
    currentCoverImage: 'https://example.com/zines.png',
    currentZineId: 1,
    coverWasRemoved: true,
  }), null);
});

test('cover policy requests generation only for incomplete fallback covers', () => {
  assert.equal(needsGeneratedCover({
    pdfUrl,
    coverImage: null,
    zineId: 1,
    hasCompleteGeneratedCover: false,
  }), true);
  assert.equal(needsGeneratedCover({
    pdfUrl,
    coverImage: 'https://example.com/custom.jpg',
    zineId: 1,
    hasCompleteGeneratedCover: false,
  }), false);
  assert.equal(needsGeneratedCover({
    pdfUrl,
    coverImage: null,
    zineId: 1,
    hasCompleteGeneratedCover: true,
  }), false);
});

test('publication service queues page generation and preserves a custom cover', async () => {
  const upload = createUpload(null);
  const created: PublicationRecord = {
    id: 12,
    tags: null,
    sourceUploadId: null,
    coverImage: null,
    pdfUrl,
    importStatus: 'pending',
    processedPdfUrl: null,
  };
  const queued: number[] = [];
  const repository = createRepository(upload, null, created);
  const service = createZinePublicationModule({
    publications: repository,
    authors: { sync: async () => {} },
    covers: { isAvailable: async () => false },
    processing: { request: async (zineId) => { queued.push(zineId); } },
  });

  await service.publishZineFromUpload(7);
  assert.deepEqual(queued, [12]);

  const customUpload = createUpload('https://example.com/custom.jpg');
  const customRepository = createRepository(customUpload, null, {
    ...created,
    coverImage: 'https://example.com/custom.jpg',
    importStatus: 'completed',
    activePageGeneration: 'generation-1',
  });
  const customQueued: number[] = [];
  const customService = createZinePublicationModule({
    publications: customRepository,
    authors: { sync: async () => {} },
    covers: { isAvailable: async () => false },
    processing: { request: async (zineId) => { customQueued.push(zineId); } },
  });

  await customService.publishZineFromUpload(7);
  assert.deepEqual(customQueued, [12]);
});

function createUpload(coverImage: string | null): PublicationUpload {
  return {
    title: 'Test zine',
    description: null,
    collectionTitle: null,
    coverImage,
    pdfUrl,
    tags: null,
    publishedYear: null,
    authors: [{ name: 'Test author', socialLinks: [] }],
  };
}

function createRepository(
  upload: PublicationUpload,
  existing: PublicationRecord | null,
  created: PublicationRecord,
): PublicationRepository {
  return {
    findUpload: async () => upload,
    findBySlug: async () => existing,
    findById: async () => created,
    updateUpload: async () => {},
    markUploadPublished: async () => {},
    insert: async () => created.id,
    update: async () => {},
    setPublished: async () => {},
  };
}
