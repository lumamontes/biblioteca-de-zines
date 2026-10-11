import { randomUUID } from 'node:crypto';
import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import { isPlaceholderCover } from '@/utils/cover-image';
import { forEachPageFromPdf } from './pdf-service';
import type { AssetStorage } from './asset-storage';

export type SourceDocument = {
  buffer: Buffer;
  mimeType: string;
};

export type PageGenerationState = {
  coverImage: string | null;
  zineId: number;
};

export type PageGenerationRepository = {
  getState: (zineId: number) => Promise<PageGenerationState>;
  markFailed: (zineId: number) => Promise<void>;
  markProcessing: (zineId: number) => Promise<void>;
  publish: (generation: {
    coverImage?: string;
    generationId: string;
    pages: Array<{ imageUrl: string; pageNumber: number }>;
    totalPages: number;
    zineId: number;
  }) => Promise<void>;
};

export async function createPageGeneration(
  loadSource: () => Promise<SourceDocument>,
  zineId: number,
  repository: PageGenerationRepository,
  storage: AssetStorage,
): Promise<void> {
  const generationId = randomUUID();
  let state: PageGenerationState | undefined;

  try {
    state = await repository.getState(zineId);
    await repository.markProcessing(zineId);
    const source = await loadSource();

    const contentType = isPdf(source) ? 'image/png' : source.mimeType;
    if (!isPdf(source) && !isImage(source)) {
      throw new Error(`Unsupported source file type: ${source.mimeType}`);
    }

    const pages: Array<{ imageUrl: string; pageNumber: number }> = [];
    let coverImage: string | undefined;
    const uploadPage = async (pageBuffer: Buffer, pageNumber: number) => {
      const imageUrl = await storage.upload({
        data: pageBuffer,
        contentType,
        generationId,
        kind: 'page',
        pageNumber,
        zineId,
      });
      pages.push({ imageUrl, pageNumber });

      if (pageNumber === 1 && isPlaceholderCover(state?.coverImage ?? null)) {
        coverImage = await storage.upload({
          data: pageBuffer,
          contentType,
          generationId,
          kind: 'cover',
          zineId,
        });
      }
    };

    const totalPages = isPdf(source)
      ? await forEachPageFromPdf(source.buffer, uploadPage)
      : await uploadImage(source.buffer, uploadPage);
    if (totalPages === 0) throw new Error('The source PDF has no pages');

    await repository.publish({
      ...(coverImage ? { coverImage } : {}),
      generationId,
      pages,
      totalPages,
      zineId,
    });
  } catch (error) {
    await repository.markFailed(zineId).catch((failureError) => {
      console.error('Failed to record page-generation failure:', failureError);
    });
    await storage.deleteGeneration(zineId, generationId).catch((cleanupError) => {
      console.error('Failed to remove incomplete page generation:', cleanupError);
    });
    throw error;
  }
}

function isPdf(source: SourceDocument): boolean {
  return source.mimeType.includes('pdf') || source.buffer.subarray(0, 4).toString() === '%PDF';
}

function isImage(source: SourceDocument): boolean {
  return source.mimeType.startsWith('image/') || detectFileTypeFromBuffer(source.buffer).mimeType.startsWith('image/');
}

async function uploadImage(
  buffer: Buffer,
  uploadPage: (pageBuffer: Buffer, pageNumber: number) => Promise<void>,
): Promise<number> {
  await uploadPage(buffer, 1);
  return 1;
}
