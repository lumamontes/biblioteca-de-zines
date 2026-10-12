import { createClient } from '@/utils/supabase/server';
import { createSupabaseAuthorReader } from '@/infrastructure/authors/supabase-author-reader';

export async function createAuthorReader() {
  return createSupabaseAuthorReader(await createClient());
}
