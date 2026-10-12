import { createClient } from "@/utils/supabase/server";
import { PostgrestResponse } from "@supabase/supabase-js";
import { Zine } from "@/@types/zine";
import { Database, Tables } from "@/types/database.types";
import { Author as SubmissionAuthor } from "@/schemas/apply-zine";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Author = Tables<"authors">;

export async function syncAuthorsToZine(
  supabase: SupabaseClient<Database>,
  zineId: number,
  authors: SubmissionAuthor[],
): Promise<void> {
  for (const author of authors) {
    const name = author.name.trim();
    if (!name) continue;
    const url = (author.socialLinks || [])
      .map((link) => link.trim())
      .filter(Boolean)
      .join(", ") || null;

    const { data: existingAuthor } = await supabase
      .from("authors")
      .select("id")
      .eq("name", name)
      .single();
    let authorId = existingAuthor?.id;
    if (!authorId) {
      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert([{ name, url }])
        .select("id")
        .single();
      if (error || !newAuthor) throw new Error(`Erro ao criar autor: ${error?.message}`);
      authorId = newAuthor.id;
    }

    const { data: relation } = await supabase
      .from("library_zines_authors")
      .select("id")
      .eq("zine_id", zineId)
      .eq("author_id", authorId)
      .single();
    if (!relation) {
      const { error } = await supabase
        .from("library_zines_authors")
        .insert([{ zine_id: zineId, author_id: authorId }]);
      if (error) throw new Error(`Erro ao associar autor: ${error.message}`);
    }
  }
}

export const getAuthorBySlug = async (slug: string): Promise<Author | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching author by slug:", error.message);
    throw new Error(error.message);
  }

  return data ?? null;
};

export const getAuthorZines = async (authorId: number): Promise<Zine[]> => {
  const supabase = await createClient();

  const { data, error }: PostgrestResponse<Zine> = await supabase
    .from("library_zines")
    .select(
      "*, library_zines_authors!inner(authors!inner(id, name, url, slug))"
    )
    .eq("is_published", true)
    .eq("library_zines_authors.author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching author zines:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getAllAuthors = async (): Promise<Author[]> => {
  const supabase = await createClient();

  const { data, error }: PostgrestResponse<Author> = await supabase
    .from("authors")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching authors:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
};
