import { randomUUID } from 'node:crypto';
import type { AssetTarget } from '@/application/asset-storage';
import type { SourceDocument } from '@/domain/source-document';
import type { CoverRenderer, PageGenerationRepository, PageGenerationStorage, PageRenderer, RenderedPage, StoredPage, PageDerivativeRecorder } from './page-generation-types';

export async function createPageGeneration(
  loadSource: () => Promise<SourceDocument>,
  renderPages: PageRenderer,
  repository: PageGenerationRepository,
  storage: PageGenerationStorage,
  target: AssetTarget,
  sourceUrl: string,
  options: { createCover?: CoverRenderer; createGenerationId?: () => string; sourceObservationId?: number | (() => number | undefined); recordDerivatives?: PageDerivativeRecorder } = {},
): Promise<void> {
  const generationId = options.createGenerationId?.() ?? randomUUID();
  const pages: StoredPage[] = [];
  let firstPage: RenderedPage | undefined;

  if (!await repository.isProcessable(target, sourceUrl)) return;

  try {
    await repository.markProcessing(target);
    const source = await loadSource();
    if (!source.mimeType.includes('pdf') && source.buffer.subarray(0, 4).toString() !== '%PDF') {
      throw new Error(`Unsupported page-generation source file type: ${source.mimeType}`);
    }
    const renderedPageCount = await renderPages(source, async (page) => {
      validateRenderedPage(page);
      firstPage ??= page;
      const imageUrl = await storage.uploadPage({ ...page, generationId, target });
      const { data, ...pageMetadata } = page;
      void data;
      const storedPage: StoredPage = { ...pageMetadata, generationId, imageUrl };
      if (!await storage.isPageAvailable(target, storedPage)) {
        throw new Error(`Uploaded page ${page.pageNumber} is not available`);
      }
      pages.push(storedPage);
    });

    validateCompleteGeneration(pages, renderedPageCount);
    const coverImage = firstPage && options.createCover
      ? await options.createCover(firstPage).then((cover) => storage.uploadCover({ ...cover, generationId, target }))
      : undefined;
    const result = await repository.activate({ generationId, pages, sourceUrl, target, coverImage });
    if (!result.activated) {
      await discardGeneration(storage, target, generationId);
      return;
    }
    const sourceObservationId = typeof options.sourceObservationId === 'function' ? options.sourceObservationId() : options.sourceObservationId;
    if (sourceObservationId !== undefined && sourceObservationId >= 0 && options.recordDerivatives) {
      await options.recordDerivatives({ sourceObservationId, assets: pages.map((page) => ({ assetIdentity: page.imageUrl, storageReference: page.imageUrl, mediaType: page.contentType, byteSize: null, assetKind: 'derivative' })) }).catch((error) => {
        console.error('Failed to record generated page observations:', error);
      });
      if (coverImage) await options.recordDerivatives({ sourceObservationId, assets: [{ assetIdentity: coverImage, storageReference: coverImage, mediaType: 'image/webp', byteSize: null, assetKind: 'preview' }] }).catch((error) => {
        console.error('Failed to record generated preview observation:', error);
      });
    }
    if (coverImage && result.coverImageUsed === false) await storage.deleteCover(target, generationId).catch(() => undefined);
    if (result.previousGenerationId) await discardGeneration(storage, target, result.previousGenerationId);
  } catch (error) {
    await repository.markFailed(target).catch(() => undefined);
    await discardGeneration(storage, target, generationId);
    throw error;
  }
}

function validateRenderedPage(page: RenderedPage): void {
  if (!Number.isInteger(page.pageNumber) || page.pageNumber < 1) throw new Error(`Invalid rendered page number: ${page.pageNumber}`);
  if (!Number.isInteger(page.width) || page.width < 1 || !Number.isInteger(page.height) || page.height < 1) {
    throw new Error(`Invalid rendered page dimensions for page ${page.pageNumber}`);
  }
  if (!page.contentType.startsWith('image/')) throw new Error(`Invalid rendered page content type: ${page.contentType}`);
}

function validateCompleteGeneration(pages: StoredPage[], expectedPageCount: number): void {
  if (!Number.isInteger(expectedPageCount) || expectedPageCount < 1) throw new Error('The source PDF has no pages');
  if (pages.length !== expectedPageCount) throw new Error(`Expected ${expectedPageCount} rendered pages, received ${pages.length}`);
  const pageNumbers = pages.map((page) => page.pageNumber).sort((a, b) => a - b);
  if (pageNumbers.some((pageNumber, index) => pageNumber !== index + 1)) throw new Error('Rendered page generation is incomplete or out of order');
}

async function discardGeneration(storage: PageGenerationStorage, target: AssetTarget, generationId: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try { await storage.deleteGeneration(target, generationId); return; } catch (error) {
      if (attempt === 3) console.error(`Failed to remove page generation ${generationId}:`, error);
    }
  }
}
