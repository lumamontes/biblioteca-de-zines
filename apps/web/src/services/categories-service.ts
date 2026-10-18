import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/database.types";

export const getCategories = async (): Promise<Tables<"categories">[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
}; 