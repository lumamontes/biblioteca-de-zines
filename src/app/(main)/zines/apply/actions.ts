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

  // Extract form data
  const authorsJson = formData.get("authors") as string;
  const zinesJson = formData.get("zines") as string;
  const telegramInterest = formData.get("telegramInterest") as string;
  const contactEmail = formData.get("contactEmail") as string;

  // Parse JSON arrays
  let authors: Author[] = [];
  let zines: Zine[] = [];
  
  try {
    authors = JSON.parse(authorsJson || "[]");
    zines = JSON.parse(zinesJson || "[]");
  } catch (error) {
    console.error('Error parsing JSON fields:', error);
    throw new Error('Erro ao processar dados do formulário');
  }

  // Validate required fields
  if (!authors.length || !authors[0].name.trim()) {
    throw new Error('Pelo menos um autor é obrigatório');
  }

  if (!zines.length) {
    throw new Error('Pelo menos uma zine é obrigatória');
  }

  // Validate that all zines have required fields
  for (const zine of zines) {
    if (!zine.title.trim() || !zine.pdfUrl.trim()) {
      throw new Error('Título e link do PDF são obrigatórios para todas as zines');
    }
  }

  // Prepare author data for storage
  const authorNames = authors.map(author => author.name.trim()).filter(name => name);
  const allSocialLinks = authors.flatMap(author => 
    author.socialLinks.filter(link => link.trim())
  );

  // Insert each zine as a separate record
  const insertPromises = zines.map(async (zine) => {
    const zineData: TablesInsert<"form_uploads"> = {
      title: zine.title.trim(),
      collection_title: zine.collectionTitle.trim() || null,
      author_name: authorNames.join(", "), // Store all authors for each zine
      author_url: allSocialLinks.length > 0 ? allSocialLinks.join(", ") : null,
      pdf_url: zine.pdfUrl.trim(),
      description: zine.description.trim() || null,
      cover_image: zine.coverImageUrl.trim() || null,
      tags: JSON.stringify({
        publication_year: zine.publicationYear.trim(),
        telegram_interest: telegramInterest,
        contact_email: contactEmail,
        authors_structured: authors, // Store structured author data
        submission_batch_id: Date.now().toString(), // Group zines from same submission
      }),
      is_published: false, // Default to unpublished, admin will review and publish
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

  // Wait for all zines to be inserted
  const results = await Promise.all(insertPromises);

  // Send notification email (optional - you can implement this later)
  // await sendNotificationEmail(contactEmail, zines.map(z => z.title));

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
  
  // Redirect outside of try-catch to avoid catching NEXT_REDIRECT
  if (hasError) {
    redirect('/zines/apply?error=true');
  } else {
    redirect('/zines/apply?success=true');
  }
} 