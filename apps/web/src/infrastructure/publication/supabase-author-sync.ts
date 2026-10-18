import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { PublicationAuthor } from '@/application/publication/zine-publication-types';

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
      .select('id, url')
      .eq('name', name)
      .single();
    let authorId: number;
    if (!existingAuthor) {
      const { data: newAuthor, error } = await supabase
        .from('authors')
        .insert([{ name, url }])
        .select('id')
        .single();
      if (error || !newAuthor) throw new Error(`Erro ao criar autor: ${error?.message}`);
      authorId = newAuthor.id;
    } else {
      authorId = existingAuthor.id;
      const nextUrl = mergeAuthorLinks(existingAuthor.url, url);
      if (nextUrl !== existingAuthor.url) {
        const { error } = await supabase
          .from('authors')
          .update({ url: nextUrl })
          .eq('id', authorId);
        if (error) throw new Error(`Erro ao atualizar autor: ${error.message}`);
      }
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

function mergeAuthorLinks(existing: string | null, incoming: string | null) {
  const links = [...splitAuthorLinks(existing), ...splitAuthorLinks(incoming)];
  const uniqueLinks = Array.from(new Set(links));
  return uniqueLinks.length > 0 ? uniqueLinks.join(', ') : null;
}

function splitAuthorLinks(value: string | null) {
  return (value || '')
    .split(/,\s+(?=https?:\/\/)/i)
    .map((link) => link.trim())
    .filter(Boolean);
}
