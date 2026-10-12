import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageGeneration } from '../src/application/page-generation/page-generation-service';
import type {
  PageGenerationRepository,
  PageGenerationStorage,
  RenderedPage,
} from '../src/application/page-generation/page-generation-types';
import { createPageProcessor } from '../src/infrastructure/page-generation/page-processor';

const target = { id: 42, kind: 'zine' as const };

test('uploads every rendered page and activates the complete generation', async () => {
  const events: string[] = [];
  const storage = createStorage(events);
  const repository = createRepository(events);

  await createPageGeneration(
    async () => ({ buffer: Buffer.from('%PDF source'), mimeType: 'application/pdf' }),
    async (_source, onPage) => {
      await onPage(page(1, 1200, 1800));
      await onPage(page(2, 1200, 1800));
      return 2;
    },
    repository,
    storage,
    target,
    'https://example.com/zine.pdf',
    { createGenerationId: () => 'generation-1' },
  );

  assert.deepEqual(events, [
    'processing',
    'upload:1',
    'upload:2',
    'activate:generation-1:2',
    'delete:old-generation',
  ]);
  assert.deepEqual(storage.uploaded.map(({ pageNumber, width, height }) => ({ pageNumber, width, height })), [
    { pageNumber: 1, width: 1200, height: 1800 },
    { pageNumber: 2, width: 1200, height: 1800 },
  ]);
});

test('failed or partial generations are marked failed and deleted', async () => {
  const events: string[] = [];
  const repository = createRepository(events);
  const storage = createStorage(events);

  await assert.rejects(() => createPageGeneration(
    async () => ({ buffer: Buffer.from('%PDF source'), mimeType: 'application/pdf' }),
    async (_source, onPage) => {
      await onPage(page(1, 1200, 1800));
      throw new Error('page render failed');
    },
    repository,
    storage,
    target,
    'https://example.com/zine.pdf',
    { createGenerationId: () => 'generation-1' },
  ), /page render failed/);

  assert.deepEqual(events, ['processing', 'upload:1', 'failed', 'delete:generation-1']);
});

test('does not replace the active generation when activation loses a race', async () => {
  const events: string[] = [];
  const repository = createRepository(events, false);
  const storage = createStorage(events);

  await createPageGeneration(
    async () => ({ buffer: Buffer.from('%PDF source'), mimeType: 'application/pdf' }),
    async (_source, onPage) => {
      await onPage(page(1, 1200, 1800));
      return 1;
    },
    repository,
    storage,
    target,
    'https://example.com/zine.pdf',
    { createGenerationId: () => 'generation-1' },
  );

  assert.deepEqual(events, ['processing', 'upload:1', 'activate:generation-1:1', 'delete:generation-1']);
});

test('does not process an unpublished processing job', async () => {
  const processor = createPageProcessor({
    downloadSource: async () => { throw new Error('must not download'); },
    renderPages: async () => { throw new Error('must not render'); },
    repository: createRepository([]),
    storage: createStorage([]),
  });

  await assert.rejects(() => processor({
    attemptCount: 1,
    id: 10,
    isPublished: false,
    pdfUrl: 'https://example.com/zine.pdf',
    title: 'Private submission',
    zineId: 42,
  }), /approved public publication/);
});

function page(pageNumber: number, width: number, height: number): RenderedPage {
  return {
    data: Buffer.from(`page-${pageNumber}`),
    pageNumber,
    width,
    height,
    contentType: 'image/webp',
  };
}

function createRepository(events: string[], activated = true): PageGenerationRepository {
  return {
    async markProcessing() {
      events.push('processing');
    },
    async markFailed() {
      events.push('failed');
    },
    async activate(generation) {
      events.push(`activate:${generation.generationId}:${generation.pages.length}`);
      return activated ? { activated: true, previousGenerationId: 'old-generation' } : { activated: false };
    },
  };
}

function createStorage(events: string[]): PageGenerationStorage & { uploaded: RenderedPage[] } {
  const uploaded: RenderedPage[] = [];
  return {
    uploaded,
    async uploadPage(asset) {
      uploaded.push(asset);
      events.push(`upload:${asset.pageNumber}`);
      return `https://assets.example/page-${asset.pageNumber}.webp`;
    },
    async deleteGeneration(_target, generationId) {
      events.push(`delete:${generationId}`);
    },
  };
}
