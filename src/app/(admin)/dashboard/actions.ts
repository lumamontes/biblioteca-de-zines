"use server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/utils/slug";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "@/types/database.types";
import { parseTags } from "@/utils/utils";
import { ZineTags } from "@/@types/zine";
import { editUploadSchema, EditUploadFormData } from "@/schemas/edit-upload";
import { parseUploadAuthors, flattenAuthors } from "@/utils/authors";
import { Author } from "@/schemas/apply-zine";

/** Creates/finds each author and links them to the zine (does not remove stale links). */
async function syncZineAuthors(
  supabase: SupabaseClient<Database>,
  zineId: number,
  authors: Author[],
) {
  for (const author of authors) {
    const name = author.name.trim();
    if (!name) continue;
    const url =
      (author.socialLinks || [])
        .map((link) => link.trim())
        .filter(Boolean)
        .join(", ") || null;

    const { data: existingAuthor } = await supabase
      .from("authors")
      .select("id")
      .eq("name", name)
      .single();

    let authorId;
    if (!existingAuthor) {
      const { data: newAuthor, error: authorError } = await supabase
        .from("authors")
        .insert([{ name, url }])
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

  const authors = parseUploadAuthors(upload);
  if (authors.length === 0) throw new Error("O nome do autor é obrigatório");

  const slug = generateSlug(authors[0].name, upload.title);

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

  await syncZineAuthors(supabase, zineId, authors);

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
    const { author_name, author_url } = flattenAuthors(validatedData.authors);

    const { error } = await supabase
      .from("form_uploads")
      .update({
        title: validatedData.title,
        description: validatedData.description || null,
        collection_title: validatedData.collection_title || null,
        author_name,
        author_url,
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
