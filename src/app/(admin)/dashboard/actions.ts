"use server";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/utils/slug";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Tables } from "../../../../database.types";

/** 📌 Unpublish a Zine */
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
  if (!existingZine?.id) {
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
          year: upload.published_year,
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
      if (!existingAuthor?.id) {
        const { data: newAuthor, error: authorError } = await supabase
          .from("authors")
          .insert([
            { name, url: upload.author_url, email: upload.author_email },
          ])
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

export async function updateZinesWithFormUploads() {
  try {
    const supabase = await createClient();

    const { data: uploads, error } = await supabase
      .from("form_uploads")
      .select("*");

    if (error) throw new Error(`Erro ao buscar uploads: ${error.message}`);

    for (const upload of uploads) {
      const slug = generateSlug(upload.author_name, upload.title);

      const { data: existingZine, error: zineError } = await supabase
        .from("library_zines")
        .select("id, year, pdf_url, slug")
        .eq("slug", slug)
        .single();

      if (zineError) {
        console.warn(`Zine não encontrada para slug: ${slug}`);
        continue;
      }

      if (existingZine?.id) {
        const { error: updateZineError } = await supabase
          .from("library_zines")
          .update({
            year: upload.published_year,
            pdf_url: upload.pdf_url,
          })
          .eq("id", existingZine.id);

        if (updateZineError) {
          throw new Error(`Erro ao atualizar zine: ${updateZineError.message}`);
        }
      }
    }

    console.log("Sincronização concluída com sucesso!");
  } catch (err) {
    console.error(
      "Erro ao sincronizar uploads com zines:",
      JSON.stringify(err, null, 2)
    );
    throw new Error("Falha ao sincronizar uploads com zines.");
  }
}

export async function sendEmailToAuthor(zineTitle: string, authorEmail: string, zineId: number) {
  const supabase = await createClient();

  try {

    if (!authorEmail || !authorEmail.includes("@")) {
      throw new Error("E-mail inválido para o autor.");
    }
    const response = await fetch(
      "https://yuafnmuqgjxbiumcdqsl.supabase.co/functions/v1/resend",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_email: authorEmail,
          zine_title: zineTitle
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Falha ao enviar o e-mail: ${JSON.stringify(errorData)}`);
    }

    const { error } = await supabase
      .from("library_zines")
      .update({ send_email: true })
      .eq("id", zineId);

    if (error) {
      throw new Error(`Erro ao atualizar o status de envio: ${error.message}`);
    }

    return { success: true, message: "E-mail enviado com sucesso." };
  } catch (error) {
    if(error instanceof Error) {
      console.error("Erro ao enviar e-mail para o autor:", error.message);
      return { success: false, error: error.message };
    }
    console.error("Erro ao enviar e-mail para o autor:", error);
    return { success: false, error: "Erro ao enviar e-mail para o autor." };
  }
}


