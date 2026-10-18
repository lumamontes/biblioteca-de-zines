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
      const { data: publishedRelations, error: relationsError } = await supabase
        .from('library_zines_authors')
        .select('author_id, zine_id, library_zines!inner(is_published)')
        .eq('library_zines.is_published', true);

      if (relationsError) throw new Error(relationsError.message);

      const publishedZinesByAuthor = new Map<number, Set<number>>();
      for (const relation of publishedRelations ?? []) {
        const zineIds = publishedZinesByAuthor.get(relation.author_id) ?? new Set<number>();
        zineIds.add(relation.zine_id);
        publishedZinesByAuthor.set(relation.author_id, zineIds);
      }

      const authorIds = Array.from(publishedZinesByAuthor.entries())
        .filter(([, zineIds]) => zineIds.size > 0)
        .map(([authorId]) => authorId);

      if (authorIds.length === 0) return [];

      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .in('id', authorIds)
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}
