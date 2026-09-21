import { z } from "zod";
import { AuthorSchema } from "./apply-zine";

export const editUploadSchema = z.object({
  slug: z.string(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  collection_title: z.string().optional(),
  authors: z.array(AuthorSchema).min(1, "Pelo menos um autor é obrigatório"),
  author_email: z.string().email("Email inválido").or(z.literal("")),
  pdf_url: z.string().url("URL do PDF inválida").optional().or(z.literal("")),
  cover_image: z.string().url("URL da capa inválida").optional().or(z.literal("")),
  published_year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  categories: z.array(z.string()).optional(),
});

export type EditUploadFormData = z.infer<typeof editUploadSchema>; 