import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createZinePublicationModule } from '@/application/publication/publication-module';
import { syncAuthorsToZine } from '@/infrastructure/publication/supabase-author-sync';
import { createSupabaseZinePublicationRepository } from '@/infrastructure/publication/supabase-zine-publication-repository';
import { createZineProcessingRequester } from '@/infrastructure/processing/zine-processing-requester';
import { createR2CoverAssetStore } from '@/infrastructure/storage/r2-storage-service';

export function createSupabaseZinePublicationService(
  supabase: SupabaseClient<Database>,
) {
  return createZinePublicationModule({
    publications: createSupabaseZinePublicationRepository(supabase),
    authors: { sync: (zineId, authors) => syncAuthorsToZine(supabase, zineId, authors) },
    covers: {
      isAvailable: (zineId, coverImage) => createR2CoverAssetStore().isAvailable(
        { id: zineId, kind: 'zine' },
        coverImage,
      ),
    },
    processing: createZineProcessingRequester(),
  });
}
