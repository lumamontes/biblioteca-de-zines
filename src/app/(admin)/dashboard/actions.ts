"use server";

import { revalidatePath } from "next/cache";
import { editUploadSchema } from "@/schemas/edit-upload";
import { createClient } from "@/utils/supabase/server";
import {
  publishZineFromUpload,
  republishZine,
  updateUploadAndPublishedZine,
} from "@/services/zine-publication-service";

export async function unpublishZine(zineId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("library_zines")
    .update({ is_published: false })
    .eq("id", zineId);

  if (error) throw new Error(`Erro ao despublicar a zine: ${error.message}`);
  revalidatePath("/dashboard");
}

export async function updatePublishedZine(zineId: number) {
  const supabase = await createClient();
  await republishZine(supabase, zineId);
  revalidatePath("/dashboard");
}

export async function publishZine(uploadId: number) {
  const supabase = await createClient();
  await publishZineFromUpload(supabase, uploadId);
  revalidatePath("/dashboard");
}

export async function updateUpload(uploadId: number, data: unknown) {
  try {
    const validatedData = editUploadSchema.parse(data);
    const supabase = await createClient();
    await updateUploadAndPublishedZine(supabase, uploadId, validatedData);
    revalidatePath("/dashboard");
    return { success: true, message: "Upload atualizado com sucesso!" };
  } catch (error) {
    if (error instanceof Error) return { success: false, message: error.message };
    return { success: false, message: "Erro desconhecido ao atualizar upload" };
  }
}
