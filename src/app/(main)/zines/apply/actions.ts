"use server";

import { pipe, composable } from 'composable-functions';
import { createClient } from '@/utils/supabase/server';
import { sendTelegramNotification } from '@/utils/telegram';
import { TablesInsert } from '@/types/database.types';
import { 
  Author, 
  FormData as ZineFormData,
  FormDataSchema 
} from '@/schemas/apply-zine';

const parseFormData = composable(async (formData: globalThis.FormData) => {
  const authorsJson = formData.get("authors") as string;
  const zinesJson = formData.get("zines") as string;
  const contactEmail = formData.get("contactEmail") as string;

  if (!authorsJson || !zinesJson) {
    throw new Error('Dados do formulário não encontrados');
  }

  const authors = JSON.parse(authorsJson);
  const zines = JSON.parse(zinesJson);
  
  const parsedData: ZineFormData = {
    authors,
    zines,
    additionalInfo: {
      contactEmail: contactEmail || ''
    }
  };

  return parsedData;
});

const validateFormData = composable((formData: ZineFormData) => {
  const result = FormDataSchema.safeParse(formData);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.errors[0]?.message || 'Erro de validação');
});

const createDatabaseEntries = composable(async (formData: ZineFormData) => {
  const supabase = await createClient();
  const submissionBatchId = Date.now().toString();
  
  const authorNames = formData.authors
    .map((author: Author) => author.name.trim())
    .filter((name: string) => name);
    
  const allSocialLinks = formData.authors.flatMap((author: Author) => 
    author.socialLinks?.filter((link: string) => link.trim()) || []
  );

  const zinesData: TablesInsert<"form_uploads">[] = formData.zines.map((zine) => ({
    title: zine.title.trim(),
    collection_title: zine.collectionTitle?.trim() || null,
    author_name: authorNames.join(", "),
    author_url: allSocialLinks.length > 0 ? allSocialLinks.join(", ") : null,
    pdf_url: zine.pdfUrl.trim(),
    description: zine.description?.trim() || null,
    cover_image: zine.coverImageUrl?.trim() || null,
    tags: JSON.stringify({
      publication_year: zine.year.trim(),
      submission_batch_id: submissionBatchId,
    }),
    is_published: false,
  }));

  const { data, error } = await supabase
    .from("form_uploads")
    .insert(zinesData)
    .select();

  if (error) {
    console.error('Error inserting zines:', error);
    throw new Error(`Erro ao enviar ${formData.zines.length} zine${formData.zines.length !== 1 ? 's' : ''}`);
  }

  return {
    results: data,
    submissionBatchId,
    authorNames,
    zineTitles: formData.zines.map(z => z.title.trim()),
    contactEmail: formData.additionalInfo.contactEmail,
    zineCount: formData.zines.length
  };
});

export const submitZine = composable(async (formData: FormData) => {
    //usa pipe do composable-functions pra executar em sequencia
    //https://github.com/seasonedcc/composable-functions/blob/main/API.md#pipe
    const result = await pipe(
      parseFormData,
      validateFormData,
      createDatabaseEntries
    )(formData);
    
    if (!result.success) {
      throw new Error(result.errors[0]?.message || 'Erro desconhecido');
    }

    const { authorNames, zineCount, zineTitles, contactEmail, submissionBatchId, results} = result.data

    await sendTelegramNotification({
      authorNames: authorNames,
      zineCount: zineCount,
      zineTitles: zineTitles,
      contactEmail: contactEmail || undefined,
      submissionId: submissionBatchId,
    });

    return { 
      success: true, 
      message: `${zineCount} zine${zineCount !== 1 ? 's' : ''} enviada${zineCount !== 1 ? 's' : ''} com sucesso!!!`,
      data: results
    };
}); 