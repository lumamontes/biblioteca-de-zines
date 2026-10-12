"use server";

import { pipe, composable } from 'composable-functions';
import { createSubmissionServiceForRequest } from '@/composition/server/create-submission-service';
import { 
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

export const submitZine = composable(async (formData: FormData) => {
    const result = await pipe(
      parseFormData,
      validateFormData
    )(formData);
    
    if (!result.success) {
      throw new Error(result.errors[0]?.message || 'Erro desconhecido');
    }

    const submission = await createSubmissionServiceForRequest();
    const receipt = await submission.submit({
      authors: result.data.authors,
      zines: result.data.zines,
      contactEmail: result.data.additionalInfo.contactEmail,
    });

    return { 
      success: true,
      message: `${receipt.zineCount} zine${receipt.zineCount !== 1 ? 's' : ''} enviada${receipt.zineCount !== 1 ? 's' : ''} com sucesso!!!`,
      data: receipt,
    };
});
