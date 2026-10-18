import type { SupabaseClient } from '@supabase/supabase-js';
import type { Zine } from '@/@types/zine';
import type { Database } from '@/types/database.types';
import type { Author } from '@/infrastructure/authors/author-types';

export function createSupabaseAuthorReader(supabase: SupabaseClient<Database>) {
  return {
    async getBySlug(slug: string): Promise<Author | null> {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data ?? null;
    },

    async getZines(authorId: number): Promise<Zine[]> {
      const { data, error } = await supabase
        .from('library_zines')
        .select('*, library_zines_authors!inner(authors!inner(id, name, url, slug))')
        .eq('is_published', true)
        .eq('library_zines_authors.author_id', authorId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Zine[];
    },

    async getAll(): Promise<Author[]> {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}
