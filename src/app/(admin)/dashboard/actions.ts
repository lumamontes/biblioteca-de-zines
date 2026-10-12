"use server";

import { revalidatePath } from "next/cache";
import { editUploadSchema } from "@/schemas/edit-upload";
import { createClient } from "@/utils/supabase/server";
import { createSupabaseZinePublicationService } from '@/infrastructure/publication/supabase-zine-publication-dependencies';

export async function unpublishZine(zineId: number) {
  const supabase = await createClient();
  await createSupabaseZinePublicationService(supabase).unpublishZine(zineId);
  revalidatePath("/dashboard");
}

export async function updatePublishedZine(zineId: number) {
  const supabase = await createClient();
  await createSupabaseZinePublicationService(supabase).republishZine(zineId);
  revalidatePath("/dashboard");
}

export async function publishZine(uploadId: number) {
  const supabase = await createClient();
  await createSupabaseZinePublicationService(supabase).publishZineFromUpload(uploadId);
  revalidatePath("/dashboard");
}

export async function updateUpload(uploadId: number, data: unknown) {
  try {
    const validatedData = editUploadSchema.parse(data);
    const supabase = await createClient();
    await createSupabaseZinePublicationService(supabase).updateUploadAndPublishedZine(uploadId, {
      slug: validatedData.slug,
      title: validatedData.title,
      description: validatedData.description,
      collectionTitle: validatedData.collection_title,
      authors: validatedData.authors,
      pdfUrl: validatedData.pdf_url,
      coverImage: validatedData.cover_image,
      publishedYear: validatedData.published_year,
      categories: validatedData.categories,
    });
    revalidatePath("/dashboard");
    return { success: true, message: "Upload atualizado com sucesso!" };
  } catch (error) {
    if (error instanceof Error) return { success: false, message: error.message };
    return { success: false, message: "Erro desconhecido ao atualizar upload" };
  }
}
