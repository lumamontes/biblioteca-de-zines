import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createPageProcessor } from '@/infrastructure/page-generation/page-processor';
import { renderPdfPages } from '@/infrastructure/page-generation/pdf-page-renderer';
import { createR2PageGenerationStorage } from '@/infrastructure/page-generation/r2-page-generation-storage';
import { createSupabasePageGenerationRepository } from '@/infrastructure/page-generation/supabase-page-generation-repository';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';
import { optimizeCoverImage } from '@/infrastructure/cover-generation/cover-image-optimizer';

export function createZinePageProcessor(supabase: SupabaseClient<Database>) {
  return createPageProcessor({
    downloadSource,
    createCover: async (page) => ({ contentType: 'image/webp', data: await optimizeCoverImage(page.data) }),
    renderPages: renderPdfPages,
    repository: createSupabasePageGenerationRepository(supabase),
    storage: createR2PageGenerationStorage(),
  });
}
