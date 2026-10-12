import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { PublicationAuthor } from '@/application/zine-publication-types';

export async function syncAuthorsToZine(
  supabase: SupabaseClient<Database>,
  zineId: number,
  authors: PublicationAuthor[],
): Promise<void> {
  for (const author of authors) {
    const name = author.name.trim();
    if (!name) continue;
    const url = (author.socialLinks || [])
      .map((link) => link.trim())
      .filter(Boolean)
      .join(', ') || null;

    const { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .eq('name', name)
      .single();
    let authorId = existingAuthor?.id;
    if (!authorId) {
      const { data: newAuthor, error } = await supabase
        .from('authors')
        .insert([{ name, url }])
        .select('id')
        .single();
      if (error || !newAuthor) throw new Error(`Erro ao criar autor: ${error?.message}`);
      authorId = newAuthor.id;
    }

    const { data: relation } = await supabase
      .from('library_zines_authors')
      .select('id')
      .eq('zine_id', zineId)
      .eq('author_id', authorId)
      .single();
    if (!relation) {
      const { error } = await supabase
        .from('library_zines_authors')
        .insert([{ zine_id: zineId, author_id: authorId }]);
      if (error) throw new Error(`Erro ao associar autor: ${error.message}`);
    }
  }
}
