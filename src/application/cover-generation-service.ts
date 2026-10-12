import { randomUUID } from 'node:crypto';
import type { AssetStorage, AssetTarget } from './asset-storage';
import type { SourceDocument } from '@/domain/source-document';

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
  }) => Promise<boolean>;
};

export type FirstPageRenderer = (source: SourceDocument) => Promise<Buffer>;
export type CoverOptimizer = (image: Buffer) => Promise<Buffer>;

export async function createCoverGeneration(
  loadSource: () => Promise<SourceDocument>,
  target: AssetTarget,
  repository: CoverGenerationRepository,
  storage: AssetStorage,
  sourceUrl: string,
  renderFirstPage: FirstPageRenderer,
  optimizeCover: CoverOptimizer,
): Promise<void> {
  const generationId = randomUUID();
  let state: CoverGenerationState | undefined;

  try {
    state = await repository.getState(target);
    await repository.markProcessing(target);
    const source = await loadSource();
    if (!isPdf(source)) throw new Error(`Unsupported cover source file type: ${source.mimeType}`);
    const page = await renderFirstPage(source);

    const cover = await optimizeCover(page);
    const coverImage = await storage.upload({
      contentType: 'image/webp',
      data: cover,
      generationId,
      kind: 'cover',
      target,
    });

    const activated = await repository.publish({ coverImage, sourceUrl, target });
    if (!activated) {
      await storage.deleteGeneration(target, generationId);
      return;
    }
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

function isPdf(source: SourceDocument): boolean {
  return source.mimeType.includes('pdf') || source.buffer.subarray(0, 4).toString() === '%PDF';
}
