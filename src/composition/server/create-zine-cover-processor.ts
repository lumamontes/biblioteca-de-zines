import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createCoverProcessor } from '@/infrastructure/cover-generation/cover-processor';
import type { CoverProcessorOptions } from '@/infrastructure/cover-generation/cover-processor-types';
import { extractFirstPageFromPdf } from '@/infrastructure/rendering/pdf-service';
import { createR2CoverAssetStore } from '@/infrastructure/storage/r2-storage-service';
import { optimizeCoverImage } from '@/infrastructure/cover-generation/cover-image-optimizer';
import { createSupabaseZineCoverRepository } from '@/infrastructure/cover-generation/supabase-zine-cover-repository';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';

export function createZineCoverProcessor(
  supabase: SupabaseClient<Database>,
  options: CoverProcessorOptions = {},
) {
  return createCoverProcessor({
    downloadSource,
    repository: createSupabaseZineCoverRepository(supabase),
    storage: createR2CoverAssetStore(),
    renderFirstPage: (source) => extractFirstPageFromPdf(source.buffer),
    optimizeCover: optimizeCoverImage,
  }, options);
}
