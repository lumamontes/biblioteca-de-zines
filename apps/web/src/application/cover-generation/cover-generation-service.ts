import { randomUUID } from 'node:crypto';
import type { AssetTarget } from '@/application/asset-storage';
import type { SourceDocument } from '@/domain/source-document';
import type {
  CoverGenerationRepository,
  CoverAssetStore,
  CoverGenerationState,
  CoverOptimizer,
  FirstPageRenderer,
} from '@/application/cover-generation/cover-generation-types';


export async function createCoverGeneration(
  loadSource: () => Promise<SourceDocument>,
  target: AssetTarget,
  repository: CoverGenerationRepository,
  storage: CoverAssetStore,
  sourceUrl: string,
  renderFirstPage: FirstPageRenderer,
  optimizeCover: CoverOptimizer,
  options: { replaceExternalCover?: boolean; sourceType?: 'pdf' | 'image' } = {},
): Promise<void> {
  const generationId = randomUUID();
  let state: CoverGenerationState | undefined;

  try {
    state = await repository.getState(target);
    await repository.markProcessing(target);
    const source = await loadSource();
    if (options.sourceType !== 'image' && !isPdf(source)) {
      throw new Error(`Unsupported cover source file type: ${source.mimeType}`);
    }
    const page = await renderFirstPage(source);

    const cover = await optimizeCover(page);
    const coverImage = await storage.storeCover({
      data: cover,
      generationId,
      target,
    });

    const activated = await repository.publish({
      coverImage,
      expectedCoverImage: state.coverImage,
      replaceExternalCover: options.replaceExternalCover,
      sourceUrl,
      target,
    });
    if (!activated) {
      await storage.discardGeneration(target, generationId);
      return;
    }
    if (state.coverImage) {
      await storage.removeCover(target, state.coverImage).catch((cleanupError) => {
        console.error('Failed to remove superseded generated cover:', cleanupError);
      });
    }
  } catch (error) {
    await repository.markFailed(target).catch((failureError) => {
      console.error('Failed to record cover-generation failure:', failureError);
    });
    await storage.discardGeneration(target, generationId).catch((cleanupError) => {
      console.error('Failed to remove incomplete cover generation:', cleanupError);
    });
    throw error;
  }
}

function isPdf(source: SourceDocument): boolean {
  return source.mimeType.includes('pdf') || source.buffer.subarray(0, 4).toString() === '%PDF';
}
