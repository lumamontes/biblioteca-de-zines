import type { PageGenerationStorage } from '@/application/page-generation/page-generation-types';
import { createR2AssetStorage } from '@/infrastructure/storage/r2-storage-service';

export function createR2PageGenerationStorage(): PageGenerationStorage {
  const storage = createR2AssetStorage();
  return {
    deleteCover: storage.deleteGeneratedCover,
    deleteGeneration: storage.deleteGeneration,
    isPageAvailable: (target, page) => storage.isPageAvailable(target, page.generationId, page.pageNumber, page.imageUrl),
    uploadPage: (page) => storage.upload({ ...page, kind: 'page' }),
    uploadCover: (cover) => storage.upload({ ...cover, kind: 'cover' }),
  };
}
