import { createClient } from "@/utils/supabase/server";
import { createClient as createBrowser } from "@/utils/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";
import { Zine } from "@/@types/zine";
import { Tables } from "@/types/database.types";

export type Author = Tables<"authors">;

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

