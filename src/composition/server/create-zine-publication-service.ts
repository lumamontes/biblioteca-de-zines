import { createClient } from '@/utils/supabase/server';
import { createSupabaseZinePublicationService } from '@/infrastructure/publication/supabase-zine-publication-dependencies';

export async function createZinePublicationService() {
  return createSupabaseZinePublicationService(await createClient());
}
