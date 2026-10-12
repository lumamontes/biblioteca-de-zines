import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createPageProcessor } from '@/infrastructure/page-generation/page-processor';
import { renderPdfPages } from '@/infrastructure/page-generation/pdf-page-renderer';
import { createR2PageGenerationStorage } from '@/infrastructure/page-generation/r2-page-generation-storage';
import { createSupabasePageGenerationRepository } from '@/infrastructure/page-generation/supabase-page-generation-repository';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';

export function createZinePageProcessor(supabase: SupabaseClient<Database>) {
  return createPageProcessor({
    downloadSource,
    renderPages: renderPdfPages,
    repository: createSupabasePageGenerationRepository(supabase),
    storage: createR2PageGenerationStorage(),
  });
}
