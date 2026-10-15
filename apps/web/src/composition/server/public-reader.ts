import { getPublicReaderPublication } from '@/application/reader/public-reader-service';
import { createSupabasePublicReaderRepository } from '@/infrastructure/reader/supabase-public-reader-repository';
import { createClient } from '@/utils/supabase/server';

export async function getPublicReader(slug: string) {
  return getPublicReaderPublication(createSupabasePublicReaderRepository(await createClient()), slug);
}
