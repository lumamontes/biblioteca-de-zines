import { Zine } from "@/@types/zine";
import { createClient } from "@/utils/supabase/server";
import { createClient as createBrowser } from "@/utils/supabase/client";
import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";

export const getPublishedZines = async (): Promise<Zine[]> => {
  const supabase = await createClient();

  const { data, error }: PostgrestResponse<Zine> = await supabase
    .from("library_zines")
    .select(
      '*, library_zines_authors (authors (id, name, url))'
    )
    .eq("is_published", true);

  if (error) {
    console.error("Error fetching published zines:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getAllZines = async (): Promise<Zine[]> => {
  const supabase = await createClient();

  const { data, error }: PostgrestResponse<Zine> = await supabase
    .from("library_zines")
    .select(
      '*, library_zines_authors (authors (id, name, url))'
    );

  if (error) {
    console.error("Error fetching published zines:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getZineBySlug = async (slug: string): Promise<Zine | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("library_zines")
    .select(
      '*, library_zines_authors (authors (id, name, url))'
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Error fetching zine by slug:", error.message);
    throw new Error('Não foi possível encontrar a zine.');
  } 

  return data ?? null;

};

type SearchZineProps = {
  search?: string | null;
  orderBy?: string;
  authorId?: number | null;
};

export const searchZines = async ({
  search = null,
  orderBy = "all",
}): Promise<Zine[]> => {
  const supabase = await createBrowser();

  let query = supabase
    .from("library_zines")
    .select(
      "*, library_zines_authors!inner(authors!inner(id, name, url))"
    );

  if (search) {
    query = query.textSearch("title_fts", search, {
      config: "portuguese",
      type: "websearch",
    });
  }

  if (orderBy === "recent") {
    query = query.order("created_at", { ascending: false });
  }

  const { data: zines, error } = await query;

  if (error) {
    console.error("Error fetching zines:", error.message);
    throw new Error(error.message);
  }

  const authorQuery = await supabase
    .from("authors")
    .select("id, name")
    .textSearch("name_fts", search? search : '', {
      config: "portuguese",
      type: "websearch",
    });

  if (authorQuery.error) {
    console.error("Error fetching authors:", authorQuery.error.message);
    throw new Error(authorQuery.error.message);
  }

  const authorIds = authorQuery.data.map((author) => author.id);

  if (authorIds.length > 0) {
    let queryAuthorZines = supabase
      .from("library_zines")
      .select("*, library_zines_authors!inner(authors!inner(id, name, url))")
      .in("library_zines_authors.authors.id", authorIds);

    if (orderBy === "recent") {
      queryAuthorZines = queryAuthorZines.order("created_at", { ascending: false });
    }

    const { data: authorZinesData, error: authorZinesError } = await queryAuthorZines;

    if (authorZinesError) {
      console.error("Error fetching zines by author:", authorZinesError.message);
      throw new Error(authorZinesError.message);
    }

    const mergedZines = [...zines, ...authorZinesData].filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.id === value.id)
    );

    return mergedZines;
  }

  return zines ?? [];
};