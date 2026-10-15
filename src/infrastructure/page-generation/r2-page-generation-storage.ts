import type { PageGenerationStorage } from '@/application/page-generation/page-generation-types';
import { createR2AssetStorage } from '@/infrastructure/storage/r2-storage-service';

export function createR2PageGenerationStorage(): PageGenerationStorage {
  const storage = createR2AssetStorage();
  return {
    deleteCover: storage.deleteGeneratedCover,
    deleteGeneration: storage.deleteGeneration,
    isPageAvailable(target, page) {
      return storage.isPageAvailable(target, page.generationId, page.pageNumber, page.imageUrl);
    },
    uploadPage(page) {
      return storage.upload({
        contentType: page.contentType,
        data: page.data,
        generationId: page.generationId,
        height: page.height,
        kind: 'page',
        pageNumber: page.pageNumber,
        target: page.target,
        width: page.width,
      });
    },
    uploadCover(cover) {
      return storage.upload({
        contentType: cover.contentType,
        data: cover.data,
        generationId: cover.generationId,
        kind: 'cover',
        target: cover.target,
      });
    },
  };
}
