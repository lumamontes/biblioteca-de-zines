import { createClient } from "@/utils/supabase/server";
import { PostgrestResponse } from "@supabase/supabase-js";

export const getPublishedZines = async (): Promise<Zine[]> => {
  const supabase = await createClient();

  const { data, error }: PostgrestResponse<Zine> = await supabase
    .from("zines")
    .select("*")
    .eq("is_published", true);

  if (error) {
    console.error("Error fetching published zines:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getZineByUuid = async (uuid: string): Promise<Zine | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("zines")
    .select("*")
    .eq("uuid", uuid)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Error fetching zine by slug:", error.message);
    throw new Error(error.message);
  } 

  return data ?? null;

};
