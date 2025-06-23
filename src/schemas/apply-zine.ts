import { z } from "zod";

export const AuthorSchema = z.object({
  name: z.string().min(1, "Ei! Me diga seu nome 💜"),
  socialLinks: z.array(z.string().url("Link inválido")).optional().default([]),
});

export const ZineSchema = z
  .object({
    id: z.string(),
    title: z.string().min(1, "Me conta o título do seu livrinho 💫"),
    collectionTitle: z.string().optional().default(""),
    year: z
      .string()
      .min(4, "Ano com 4 dígitos, por favor")
      .max(4, "Ano com 4 dígitos, por favor"),
    description: z.string().optional().default(""),

    pdfFile: z
      .custom<File>((v) => v instanceof File, "Envie o arquivo PDF da zine")
      .optional().nullable(),
    pdfUrl: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^https?:\/\/.+/.test(val), {
        message: "URL do PDF inválida",
      }),
    coverImageFile: z
      .custom<File>((v) => v instanceof File, "Envie a capa em imagem")
      .optional().nullable(),
    coverImageUrl: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^https?:\/\/.+/.test(val), {
        message: "URL da imagem inválida",
      }),
  })
  .refine(
    (data) =>
      (data.pdfFile instanceof File || typeof data.pdfUrl === "string" && data.pdfUrl.trim().length > 0),
    {
      message: "Você precisa enviar um PDF ou fornecer a URL do PDF",
      path: ["pdfFile"],
    }
  )


export const AdditionalInfoSchema = z.object({
  contactEmail: z.string().email("Email inválido").or(z.literal("")),
});
export const FormDataZineSchema = z.object({
  authors: z
    .array(AuthorSchema)
    .min(1, "Ei! Me diga quem escreveu essa maravilha 💜"),
  zines: z
    .array(ZineSchema)
    .min(1, "Cadê seu livrinho em PDF? Adicione ao menos uma zine pra gente seguir 💫"),
  additionalInfo: AdditionalInfoSchema,
});

export type FormZineData = z.infer<typeof FormDataZineSchema>;
export type Author = z.infer<typeof AuthorSchema>;
