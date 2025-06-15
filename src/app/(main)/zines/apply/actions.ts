"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "../../../../../database.types";
import { redirect } from "next/navigation";

interface Author {
  name: string;
  socialLinks: string[];
}

interface Zine {
  id: string;
  title: string;
  collectionTitle: string;
  publicationYear: string;
  pdfUrl: string;
  description: string;
  coverImageUrl: string;
}

export async function submitZineApplication(formData: FormData) {
  const supabase = await createClient();

  const authorsJson = formData.get("authors") as string;
  const zinesJson = formData.get("zines") as string;
  const telegramInterest = formData.get("telegramInterest") as string;
  const contactEmail = formData.get("contactEmail") as string;

  let authors: Author[] = [];
  let zines: Zine[] = [];
  
  try {
    authors = JSON.parse(authorsJson || "[]");
    zines = JSON.parse(zinesJson || "[]");
  } catch (error) {
    console.error('Error parsing JSON fields:', error);
    throw new Error('Erro ao processar dados do formulário');
  }

  if (!authors.length || !authors[0].name.trim()) {
    throw new Error('Pelo menos um autor é obrigatório');
  }

  if (!zines.length) {
    throw new Error('Pelo menos uma zine é obrigatória');
  }

  for (const zine of zines) {
    if (!zine.title.trim() || !zine.pdfUrl.trim()) {
      throw new Error('Título e link do PDF são obrigatórios para todas as zines');
    }
  }

  const authorNames = authors.map(author => author.name.trim()).filter(name => name);
  const allSocialLinks = authors.flatMap(author => 
    author.socialLinks.filter(link => link.trim())
  );

  const insertPromises = zines.map(async (zine) => {
    const zineData: TablesInsert<"form_uploads"> = {
      title: zine.title.trim(),
      collection_title: zine.collectionTitle.trim() || null,
      author_name: authorNames.join(", "),
      author_url: allSocialLinks.length > 0 ? allSocialLinks.join(", ") : null,
      pdf_url: zine.pdfUrl.trim(),
      description: zine.description.trim() || null,
      cover_image: zine.coverImageUrl.trim() || null,
      tags: JSON.stringify({
        publication_year: zine.publicationYear.trim(),
        telegram_interest: telegramInterest,
        contact_email: contactEmail,
        authors_structured: authors,
        submission_batch_id: Date.now().toString(),
      }),
      is_published: false,
    };

    const { data, error } = await supabase
      .from("form_uploads")
      .insert(zineData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting zine:', error);
      throw new Error(`Erro ao enviar zine "${zine.title}"`);
    }

    return data;
  });

  const results = await Promise.all(insertPromises);

  // Aqui depois podemos enviar notificação para o email do autor ou pro email da biblioteca

  return { success: true, data: results };
}

export async function submitZineApplicationWithRedirect(formData: FormData) {
  let hasError = false;
  
  try {
    await submitZineApplication(formData);
  } catch (error) {
    console.error('Form submission error:', error);
    hasError = true;
  }
  
  if (hasError) {
    redirect('/zines/apply?error=true');
  } else {
    redirect('/zines/apply?success=true');
  }
} 