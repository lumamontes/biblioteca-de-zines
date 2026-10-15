"use server";

import { revalidatePath } from "next/cache";
import { editUploadSchema } from "@/schemas/edit-upload";
import { createPublicationModule } from '@/composition/server/publication-module';

export async function unpublishZine(zineId: number) {
  await (await createPublicationModule()).unpublishZine(zineId);
  revalidatePath("/dashboard");
}

export async function updatePublishedZine(zineId: number) {
  await (await createPublicationModule()).republishZine(zineId);
  revalidatePath("/dashboard");
}

export async function publishZine(uploadId: number) {
  await (await createPublicationModule()).publishZineFromUpload(uploadId);
  revalidatePath("/dashboard");
}

export async function updateUpload(uploadId: number, data: unknown) {
  try {
    const validatedData = editUploadSchema.parse(data);
    await (await createPublicationModule()).updateUploadAndPublishedZine(uploadId, {
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
