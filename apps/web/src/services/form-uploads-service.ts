import { PostgrestResponse } from "@supabase/supabase-js";
import { Tables } from "@/types/database.types";
import { createClient } from "@/utils/supabase/server";

export const getFormUploads = async (): Promise<Tables<"form_uploads">[]> => {
  const supabase = await createClient();

  const { data, error }: PostgrestResponse<Tables<"form_uploads">> = await supabase
    .from("form_uploads")
    .select(
      '*'
    );

  if (error) {
    console.error("Error fetching published zines:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
};