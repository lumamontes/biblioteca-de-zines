import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import { extractFirstPageFromPdf } from './pdf-service';
import type { AssetStorage, AssetTarget } from './asset-storage';
import type { SourceDocument } from './page-generation-module';

export type CoverGenerationState = {
  coverImage: string | null;
};

export type CoverGenerationRepository = {
  getState: (target: AssetTarget) => Promise<CoverGenerationState>;
  markFailed: (target: AssetTarget) => Promise<void>;
  markProcessing: (target: AssetTarget) => Promise<void>;
  publish: (generation: {
    coverImage: string;
    sourceUrl: string;
    target: AssetTarget;
  }) => Promise<void>;
};

export async function createCoverGeneration(
  loadSource: () => Promise<SourceDocument>,
  target: AssetTarget,
  repository: CoverGenerationRepository,
  storage: AssetStorage,
  sourceUrl: string,
): Promise<void> {
  const generationId = randomUUID();
  let state: CoverGenerationState | undefined;

  try {
    state = await repository.getState(target);
    await repository.markProcessing(target);
    const source = await loadSource();
    const page = isPdf(source)
      ? await extractFirstPageFromPdf(source.buffer)
      : isImage(source)
        ? source.buffer
        : null;
    if (!page) throw new Error(`Unsupported cover source file type: ${source.mimeType}`);

    const cover = await optimizeCoverImage(page);
    const coverImage = await storage.upload({
      contentType: 'image/webp',
      data: cover,
      generationId,
      kind: 'cover',
      target,
    });

    await repository.publish({ coverImage, sourceUrl, target });
    if (state.coverImage) {
      await storage.deleteCover(target, state.coverImage).catch((cleanupError) => {
        console.error('Failed to remove superseded generated cover:', cleanupError);
      });
    }
  } catch (error) {
    await repository.markFailed(target).catch((failureError) => {
      console.error('Failed to record cover-generation failure:', failureError);
    });
    await storage.deleteGeneration(target, generationId).catch((cleanupError) => {
      console.error('Failed to remove incomplete cover generation:', cleanupError);
    });
    throw error;
  }
}

export async function optimizeCoverImage(image: Buffer): Promise<Buffer> {
  return sharp(image)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
}

function isPdf(source: SourceDocument): boolean {
  return source.mimeType.includes('pdf') || source.buffer.subarray(0, 4).toString() === '%PDF';
}

function isImage(source: SourceDocument): boolean {
  return source.mimeType.startsWith('image/') || detectFileTypeFromBuffer(source.buffer).mimeType.startsWith('image/');
}
