"use server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/utils/slug";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Tables } from "@/types/database.types";

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
  const { error } = await supabase
    .from("library_zines")
    .update({ is_published: true })
    .eq("id", zineId);

  if (error) throw new Error(`Erro ao atualizar a zine: ${error.message}`);

  revalidatePath("/dashboard");
}

/** 📌 Publish a Zine (Migrate from `form_uploads` to `library_zines`) */
export async function publishZine(uploadId: number) {
  const supabase = await createClient();

  const {
    data: upload,
    error: fetchError,
  }: PostgrestSingleResponse<Tables<"form_uploads">> = await supabase
    .from("form_uploads")
    .select("*")
    .eq("id", uploadId)
    .single();

  if (fetchError || !upload)
    throw new Error(`Erro ao buscar zine: ${fetchError?.message}`);

  if (!upload.author_name) throw new Error("O nome do autor é obrigatório");

  const slug = generateSlug(upload.author_name, upload.title);

  const { data: existingZine } = await supabase
    .from("library_zines")
    .select("id")
    .eq("slug", slug)
    .single();

  let zineId;
  if (!existingZine) {
    const { data: newZine, error: insertError } = await supabase
      .from("library_zines")
      .insert([
        {
          title: upload.title,
          description: upload.description,
          collection_title: upload.collection_title,
          cover_image: upload.cover_image,
          pdf_url: upload.pdf_url,
          tags: upload.tags,
          is_published: true,
          slug: slug,
        },
      ])
      .select("id")
      .single();

    if (insertError)
      throw new Error(`Erro ao publicar a zine: ${insertError.message}`);

    zineId = newZine.id;
  } else {
    zineId = existingZine.id;
  }

  if (upload.author_name) {
    const authorNames = upload.author_name
      .split(/[,;]| e /)
      .map((name) => name.trim());

    for (const name of authorNames) {
      const { data: existingAuthor } = await supabase
        .from("authors")
        .select("id")
        .eq("name", name)
        .single();

      let authorId;
      if (!existingAuthor) {
        const { data: newAuthor, error: authorError } = await supabase
          .from("authors")
          .insert([{ name, url: upload.author_url }])
          .select("id")
          .single();

        if (authorError)
          throw new Error(`Erro ao criar autor: ${authorError.message}`);

        authorId = newAuthor.id;
      } else {
        authorId = existingAuthor.id;
      }

      const { data: existingRelation } = await supabase
        .from("library_zines_authors")
        .select("id")
        .eq("zine_id", zineId)
        .eq("author_id", authorId)
        .single();

      if (!existingRelation) {
        await supabase
          .from("library_zines_authors")
          .insert([{ zine_id: zineId, author_id: authorId }]);
      }
    }
  }

  await supabase
    .from("form_uploads")
    .update({ is_published: true })
    .eq("id", uploadId);

  revalidatePath("/dashboard");
}
