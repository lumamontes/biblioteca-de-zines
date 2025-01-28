import { Zine } from "@/@types/zine";
import { createClient } from "@/utils/supabase/server";
import { isUuid } from "@/utils/utils";
import { PostgrestResponse } from "@supabase/supabase-js";

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