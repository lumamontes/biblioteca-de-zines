import { randomUUID } from 'node:crypto';
import type { AssetTarget } from '@/application/asset-storage';
import type { SourceDocument } from '@/domain/source-document';
import type {
  PageGenerationRepository,
  PageGenerationStorage,
  CoverRenderer,
  PageRenderer,
  StoredPage,
} from '@/application/page-generation/page-generation-types';

export async function createPageGeneration(
  loadSource: () => Promise<SourceDocument>,
  renderPages: PageRenderer,
  repository: PageGenerationRepository,
  storage: PageGenerationStorage,
  target: AssetTarget,
  sourceUrl: string,
  options: { createCover?: CoverRenderer; createGenerationId?: () => string } = {},
): Promise<void> {
  const generationId = options.createGenerationId?.() ?? randomUUID();
  const pages: StoredPage[] = [];
  let firstPage: Parameters<CoverRenderer>[0] | undefined;

  if (!await repository.isProcessable(target, sourceUrl)) return;

  try {
    await repository.markProcessing(target);
    const source = await loadSource();
    if (!isPdf(source)) throw new Error(`Unsupported page-generation source file type: ${source.mimeType}`);
    const renderedPageCount = await renderPages(source, async (page) => {
      validateRenderedPage(page);
      firstPage ??= page;
      const imageUrl = await storage.uploadPage({ ...page, generationId, target });
      const storedPage = {
        contentType: page.contentType,
        generationId,
        height: page.height,
        imageUrl,
        pageNumber: page.pageNumber,
        width: page.width,
      };
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
    if (coverImage && result.coverImageUsed === false) {
      await storage.deleteCover(target, generationId).catch((cleanupError) => {
        console.error(`Failed to remove unused generated cover ${generationId}:`, cleanupError);
      });
    }
    if (result.previousGenerationId) {
      await discardGeneration(storage, target, result.previousGenerationId);
    }
  } catch (error) {
    await repository.markFailed(target).catch((failureError) => {
      console.error('Failed to record page-generation failure:', failureError);
    });
    await discardGeneration(storage, target, generationId);
    throw error;
  }
}

function isPdf(source: SourceDocument): boolean {
  return source.mimeType.includes('pdf') || source.buffer.subarray(0, 4).toString() === '%PDF';
}

function validateRenderedPage(page: StoredPage | Omit<StoredPage, 'generationId' | 'imageUrl'>): void {
  if (!Number.isInteger(page.pageNumber) || page.pageNumber < 1) {
    throw new Error(`Invalid rendered page number: ${page.pageNumber}`);
  }
  if (!Number.isInteger(page.width) || page.width < 1 || !Number.isInteger(page.height) || page.height < 1) {
    throw new Error(`Invalid rendered page dimensions for page ${page.pageNumber}`);
  }
  if (!page.contentType.startsWith('image/')) {
    throw new Error(`Invalid rendered page content type: ${page.contentType}`);
  }
}

function validateCompleteGeneration(pages: StoredPage[], expectedPageCount: number): void {
  if (!Number.isInteger(expectedPageCount) || expectedPageCount < 1) {
    throw new Error('The source PDF has no pages');
  }
  if (pages.length !== expectedPageCount) {
    throw new Error(`Expected ${expectedPageCount} rendered pages, received ${pages.length}`);
  }

  const pageNumbers = pages.map((page) => page.pageNumber).sort((left, right) => left - right);
  for (let index = 0; index < pageNumbers.length; index += 1) {
    if (pageNumbers[index] !== index + 1) {
      throw new Error('Rendered page generation is incomplete or out of order');
    }
  }
}

async function discardGeneration(
  storage: PageGenerationStorage,
  target: AssetTarget,
  generationId: string,
): Promise<void> {
  await storage.deleteGeneration(target, generationId).catch((cleanupError) => {
    console.error(`Failed to remove page generation ${generationId}:`, cleanupError);
  });
}
