import { createClient } from '@/utils/supabase/server';
import { createSupabaseZineSourceImportService } from '@/infrastructure/publication/supabase-zine-source-import';

export async function createSourceImportModule() {
  return createSupabaseZineSourceImportService(await createClient());
}
