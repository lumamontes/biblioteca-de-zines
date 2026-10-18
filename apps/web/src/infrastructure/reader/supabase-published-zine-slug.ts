import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type DatabaseClient = SupabaseClient<Database>;

export type PublishedZineSlugResolution<T> = {
  data: T;
  isAlias: boolean;
};

export async function findPublishedZineBySlug<T>(
  supabase: DatabaseClient,
  slug: string,
  select: string,
): Promise<PublishedZineSlugResolution<T> | null> {
  const current = await supabase
    .from('library_zines')
    .select(select)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (current.error) {
    throw new Error(`Failed to load published zine: ${current.error.message}`);
  }

  if (current.data) {
    return { data: current.data as T, isAlias: false };
  }

  const alias = await supabase
    .from('zine_slug_aliases')
    .select('zine_id')
    .eq('slug', slug)
    .maybeSingle();

  if (alias.error) {
    throw new Error(`Failed to load published zine alias: ${alias.error.message}`);
  }

  if (!alias.data) return null;

  const canonical = await supabase
    .from('library_zines')
    .select(select)
    .eq('id', alias.data.zine_id)
    .eq('is_published', true)
    .maybeSingle();

  if (canonical.error) {
    throw new Error(`Failed to load canonical published zine: ${canonical.error.message}`);
  }

  if (!canonical.data) return null;

  return { data: canonical.data as T, isAlias: true };
}
