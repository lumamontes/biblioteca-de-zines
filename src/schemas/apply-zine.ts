import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string().min(1, 'Nome do autor é obrigatório'),
  socialLinks: z.array(z.string().url('Link deve ser uma URL válida')).optional().default([])
});

export const ZineSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  collectionTitle: z.string().optional().default(''),
  year: z.string().min(4, 'Ano deve ter pelo menos 4 dígitos').max(4, 'Ano deve ter no máximo 4 dígitos'),
  pdfUrl: z.string().url('PDF deve ser uma URL válida'),
  description: z.string().optional().default(''),
  coverImageUrl: z.string().optional().default('').refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    'Imagem da capa deve ser uma URL válida ou estar vazia'
  ),
  categories: z.array(z.string()).max(3, 'Selecione no máximo 3 categorias').default([])
});

export const AdditionalInfoSchema = z.object({
  contactEmail: z.string().optional().default('').refine(
    (val) => val === '' || z.string().email().safeParse(val).success,
    'Email deve ser válido ou estar vazio'
  )
});

export const FormDataSchema = z.object({
  authors: z.array(AuthorSchema).min(1, 'Pelo menos um autor é obrigatório'),
  zines: z.array(ZineSchema).min(1, 'Pelo menos uma zine é obrigatória'),
  additionalInfo: AdditionalInfoSchema
});

export type Author = z.infer<typeof AuthorSchema>;
export type Zine = z.infer<typeof ZineSchema>;
export type AdditionalInfo = z.infer<typeof AdditionalInfoSchema>;
export type FormData = z.infer<typeof FormDataSchema>; 

export const FORM_STORAGE_KEY = '@biblioteca-zines/apply-zine-form-data';

interface FormDataStorage {
  authors: Author[];
  zines: Zine[];
  additionalInfo: Partial<AdditionalInfo>;
}

export const defaultFormData: FormDataStorage = {
  authors: [{ name: "", socialLinks: [] }],
  zines: [],
  additionalInfo: {}
};