"use server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/utils/slug";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Tables } from "@/types/database.types";
import { parseTags } from "@/utils/utils";
import { ZineTags } from "@/@types/zine";
import { editUploadSchema, EditUploadFormData } from "@/schemas/edit-upload";

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

  if (error) throw new Error(`Erro ao republicar a zine: ${error.message}`);

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
    .select("id, tags")
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
          year: upload.published_year,
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

    const existingTags = parseTags(existingZine.tags);
    const newTags = parseTags(upload.tags);

    const mergedCategories = Array.from(new Set([
      ...(existingTags.categories || []),
      ...(newTags.categories || []),
    ]));

    const mergedTags: ZineTags = {
      ...existingTags,
      ...newTags,
      categories: mergedCategories,
    };

    await supabase
      .from("library_zines")
      .update({ tags: mergedTags })
      .eq("id", zineId);
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

export async function updateUpload(uploadId: number, data: EditUploadFormData) {
  try {
    const validatedData = editUploadSchema.parse(data);
    const supabase = await createClient();
    
    const tags: ZineTags = {
      categories: validatedData.categories || [],
    };
    
    const { error } = await supabase
      .from("form_uploads")
      .update({
        title: validatedData.title,
        description: validatedData.description || null,
        collection_title: validatedData.collection_title || null,
        author_name: validatedData.author_name,
        author_url: validatedData.author_url || null,
        pdf_url: validatedData.pdf_url || null,
        cover_image: validatedData.cover_image || null,
        published_year: validatedData.published_year || null,
        tags: tags,
      })
      .eq("id", uploadId);


      if(validatedData.slug){
        const { error } = await supabase
        .from("library_zines")
        .update({
          title: validatedData.title,
          description: validatedData.description || null,
          collection_title: validatedData.collection_title || null,
          pdf_url: validatedData.pdf_url || null,
          cover_image: validatedData.cover_image || null,
          year: validatedData.published_year || null,
          tags: tags,
        })
        .eq("slug", validatedData.slug);

        if (error) {
          throw new Error(`Erro ao atualizar upload: ${error.message}`);
        }
      }

    if (error) {
      throw new Error(`Erro ao atualizar upload: ${error.message}`);
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Upload atualizado com sucesso!" };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Erro desconhecido ao atualizar upload" };
  }
}
