import { createClient } from '@/utils/supabase/server';
import { createSupabaseZinePublicationService } from '@/infrastructure/publication/supabase-zine-publication-dependencies';

export async function createPublicationModule() {
  return createSupabaseZinePublicationService(await createClient());
}
