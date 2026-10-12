import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createZinePublicationService } from '@/application/zine-publication-service';
import { syncAuthorsToZine } from '@/infrastructure/publication/supabase-author-sync';
import { createSupabaseZinePublicationRepository } from '@/infrastructure/publication/supabase-zine-publication-repository';
import { enqueueZineProcessing } from '@/infrastructure/processing/enqueue-zine-processing';
import { dispatchZineProcessing } from '@/infrastructure/processing/zine-processing-dispatch-service';
import { createR2AssetStorage } from '@/infrastructure/storage/r2-storage-service';

export function createSupabaseZinePublicationService(
  supabase: SupabaseClient<Database>,
) {
  return createZinePublicationService({
    publications: createSupabaseZinePublicationRepository(supabase),
    authors: { sync: (zineId, authors) => syncAuthorsToZine(supabase, zineId, authors) },
    covers: {
      isAvailable: (zineId, coverImage) => createR2AssetStorage().isCoverAvailable(
        { id: zineId, kind: 'zine' },
        coverImage,
      ),
    },
    processing: {
      async request(zineId) {
        try {
          await enqueueZineProcessing(zineId);
          await dispatchZineProcessing();
        } catch (error) {
          console.error('Erro ao enfileirar processamento da zine:', error);
        }
      },
    },
  });
}
