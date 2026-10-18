import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageGeneration } from '../src/application/page-generation/page-generation-service';
import { selectPageMigrationCandidates } from '../src/application/page-generation/page-migration-service';
import type { PageGenerationRepository, PageGenerationStorage, RenderedPage } from '../src/application/page-generation/page-generation-types';
import { createPageProcessor } from '../src/infrastructure/page-generation/page-processor';

const target = { id: 42, kind: 'zine' as const };
const page = (pageNumber: number): RenderedPage => ({ contentType: 'image/webp', data: Buffer.from(`page-${pageNumber}`), height: 1800, pageNumber, width: 1200 });

test('uploads every page and activates only the complete generation', async () => {
  const events: string[] = [];
  await createPageGeneration(async () => ({ buffer: Buffer.from('%PDF source'), mimeType: 'application/pdf' }), async (_source, onPage) => {
    await onPage(page(1)); await onPage(page(2)); return 2;
  }, repository(events), storage(events), target, 'source.pdf', { createGenerationId: () => 'generation-1' });
  assert.deepEqual(events, ['processing', 'upload:1', 'upload:2', 'activate:generation-1:2', 'delete:old-generation']);
});

test('cleans partial uploads and preserves the old active generation on failure', async () => {
  const events: string[] = [];
  await assert.rejects(() => createPageGeneration(async () => ({ buffer: Buffer.from('%PDF'), mimeType: 'application/pdf' }), async (_source, onPage) => {
    await onPage(page(1)); throw new Error('render failed');
  }, repository(events), storage(events), target, 'source.pdf', { createGenerationId: () => 'generation-1' }), /render failed/);
  assert.deepEqual(events, ['processing', 'upload:1', 'failed', 'delete:generation-1']);
});

test('refuses to process an intake job and ignores a stale publication', async () => {
  const deps = { downloadSource: async () => { throw new Error('must not download'); }, renderPages: async () => { throw new Error('must not render'); }, repository: repository([]), storage: storage([]) };
  await assert.rejects(() => createPageProcessor(deps)({ attemptCount: 1, id: 1, isPublished: false, pdfUrl: 'source.pdf', title: 'intake', zineId: 42 }), /approved public publication/);
  await createPageProcessor({ ...deps, repository: { ...repository([]), isProcessable: async () => false } })({ attemptCount: 1, id: 1, isPublished: true, pdfUrl: 'changed.pdf', title: 'stale', zineId: 42 });
});

test('backfill candidates exclude known source failures and complete generations', () => {
  const make = (id: number, extra = {}) => ({ id, title: `Zine ${id}`, is_published: true, pdf_url: `${id}.pdf`, processed_pdf_url: null, import_status: 'pending', active_page_generation: 'legacy', total_pages: 0, ...extra });
  assert.deepEqual(selectPageMigrationCandidates([make(1), make(2, { processed_pdf_url: '2.pdf', import_status: 'completed', active_page_generation: 'g1', total_pages: 2 }), make(3)], new Set([3])).map(({ id }) => id), [1]);
});

function repository(events: string[], activated = true): PageGenerationRepository {
  return { isProcessable: async () => true, markProcessing: async () => { events.push('processing'); }, markFailed: async () => { events.push('failed'); }, activate: async (generation) => { events.push(`activate:${generation.generationId}:${generation.pages.length}`); return activated ? { activated: true, previousGenerationId: 'old-generation' } : { activated: false }; } };
}
function storage(events: string[]): PageGenerationStorage {
  return { deleteCover: async () => {}, deleteGeneration: async (_target, id) => { events.push(`delete:${id}`); }, isPageAvailable: async () => true, uploadCover: async () => 'cover', uploadPage: async (asset) => { events.push(`upload:${asset.pageNumber}`); return `page-${asset.pageNumber}`; } };
}
