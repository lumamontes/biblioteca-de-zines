"use server"

import { pipe, composable } from "composable-functions"
import { createClient } from "@/utils/supabase/server"
import { sendTelegramNotification } from "@/utils/telegram"
import type { TablesInsert } from "@/types/database.types"
import { type Author, type FormZineData, FormDataZineSchema } from "@/schemas/apply-zine"
import { uploadToS3 } from "@/utils/file-actions"

const MAX_FILE_SIZE = 30 * 1024 * 1024;

type ProcessedZineData = FormZineData & {
  zinesWithUrls: Array<{
    zine: FormZineData["zines"][0]
    pdfUrl: string
    coverImageUrl: string
  }>
}



export const parseFormData = composable(async (formData: FormData) => {
  try {
    const authorsJson = formData.get("authors") as string
    const contactEmail = formData.get("contactEmail") as string

    if (!authorsJson) {
      throw new Error("Autores não encontrados")
    }

    const authors: Author[] = JSON.parse(authorsJson)

    const zineIndexes = new Set<number>()
    for (const key of formData.keys()) {
      const match = key.match(/^zines\[(\d+)\]\[/)
      if (match) {
        zineIndexes.add(Number(match[1]))
      }
    }

    if (zineIndexes.size === 0) {
      throw new Error("Nenhuma zine encontrada")
    }

    const zinesWithUrls = await Promise.all(
      Array.from(zineIndexes).map(async (idx) => {
        const title = formData.get(`zines[${idx}][title]`) as string
        const collectionTitle = (formData.get(`zines[${idx}][collectionTitle]`) as string) || ""
        const year = formData.get(`zines[${idx}][year]`) as string
        const description = (formData.get(`zines[${idx}][description]`) as string) || ""

        const pdfFile = formData.get(`zines[${idx}][pdfFile]`) as File
        const coverFile = formData.get(`zines[${idx}][coverImageFile]`) as File | null

        if (!pdfFile || pdfFile.size === 0) {
          throw new Error(`Zine ${idx + 1}: PDF é obrigatório`)
        }

        if (pdfFile.size > MAX_FILE_SIZE) {
          throw new Error(`Zine ${idx + 1}: PDF com tamanho mair que 30MB`)
        }

        if (!title?.trim()) {
          throw new Error(`Zine ${idx + 1}: Título é obrigatório`)
        }

        if (!year?.trim()) {
          throw new Error(`Zine ${idx + 1}: Ano é obrigatório`)
        }

        const timestamp = Date.now()
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()

        let pdfUrl = ""
        let coverImageUrl = ""

        try {
          const pdfPath = `${timestamp}_${sanitizedTitle}.pdf`
          pdfUrl = await uploadToS3(pdfFile, pdfPath)

          if (coverFile && coverFile.size > 0) {
            if (coverFile.size > MAX_FILE_SIZE) {
              throw new Error(`Zine ${idx + 1}: Capa com tamanho mair que 30MB`)
            }
            const coverExtension = coverFile.name.split(".").pop() || "jpg"
            const coverPath = `zines/covers/${timestamp}_${sanitizedTitle}.${coverExtension}`
            coverImageUrl = await uploadToS3(coverFile, coverPath)
          }
        } catch (uploadError) {
          console.error("Erro no upload:", uploadError)
          throw new Error(`Erro ao fazer upload dos arquivos da zine "${title}"`)
        }

        const zine = {
          id: `${timestamp}-${idx}`,
          title: title.trim(),
          collectionTitle: collectionTitle.trim(),
          year: year.trim(),
          description: description.trim(),
          pdfFile: undefined,
          coverImageFile: undefined,
        }

        return {
          zine,
          pdfUrl,
          coverImageUrl,
        }
      }),
    )

    const zines = zinesWithUrls.map((item) => item.zine)

    return {
      authors,
      zines,
      additionalInfo: {
        contactEmail: contactEmail?.trim() || "",
      },
      zinesWithUrls,
    } as ProcessedZineData
  } catch (error) {
    console.error("Erro no parseFormData:", error)
    throw error
  }
})

const validateFormData = composable((data: ProcessedZineData) => {
  try {
    const dataForValidation: FormZineData = {
      authors: data.authors,
      zines: data.zines,
      additionalInfo: data.additionalInfo,
    }

    const parsed = FormDataZineSchema.safeParse(dataForValidation)
    if (parsed.success) {
      return {
        ...parsed.data,
        zinesWithUrls: data.zinesWithUrls,
      } as ProcessedZineData
    }

    const firstError = parsed.error.errors[0]
    const errorMessage = firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Erro de validação"

    throw new Error(errorMessage)
  } catch (error) {
    console.error("Erro na validação:", error)
    throw error
  }
})

const createDatabaseEntries = composable(async (data: ProcessedZineData) => {
  try {
    const supabase = await createClient()
    const batchId = Date.now().toString()

    const authorNames = data.authors.map((a) => a.name.trim()).filter(Boolean)
    const socialUrls = data.authors.flatMap((a) => a.socialLinks || []).filter(Boolean)

    if (authorNames.length === 0) {
      throw new Error("Pelo menos um autor deve ser informado")
    }

    const uploads: TablesInsert<"form_uploads">[] = data.zinesWithUrls.map((item) => ({
      title: item.zine.title,
      collection_title: item.zine.collectionTitle || null,
      author_name: authorNames.join(", "),
      author_url: socialUrls.length ? socialUrls.join(", ") : null,
      pdf_url: item.pdfUrl,
      description: item.zine.description || null,
      cover_image: item.coverImageUrl || null,
      tags: JSON.stringify({
        publication_year: item.zine.year,
        submission_batch_id: batchId,
        contact_email: data.additionalInfo.contactEmail || null,
      }),
      is_published: false,
    }))

    const { data: inserted, error } = await supabase.from("form_uploads").insert(uploads).select()

    if (error) {
      console.error("Erro ao inserir no Supabase:", error)
      throw new Error(`Erro ao salvar no banco de dados: ${error.message}`)
    }

    if (!inserted || inserted.length === 0) {
      throw new Error("Nenhum dado foi inserido no banco")
    }

    return {
      inserted,
      batchId,
      authorNames,
      zineTitles: data.zines.map((z) => z.title),
      contactEmail: data.additionalInfo.contactEmail,
      count: data.zines.length,
    }
  } catch (error) {
    console.error("Erro no createDatabaseEntries:", error)
    throw error
  }
})

export const submitZine = async (formData: FormData) => {
  try {
    console.log("Iniciando processamento do formulário...")

    const result = await pipe(parseFormData, validateFormData, createDatabaseEntries)(formData)

    if (!result.success) {
      const errorMessage = result.errors?.[0]?.message || "Erro desconhecido no processamento"
      console.error("Erro no pipeline:", result.errors)
      return {
        success: false,
        message: errorMessage,
        data: null,
      }
    }

    const { authorNames, count, zineTitles, contactEmail, batchId, inserted } = result.data

    try {
      await sendTelegramNotification({
        authorNames,
        zineCount: count,
        zineTitles,
        contactEmail,
        submissionId: batchId,
      })
    } catch (telegramError) {
      console.error("Erro ao enviar notificação no Telegram:", telegramError)
    }

    return {
      success: true,
      message: `${count} zine${count > 1 ? "s" : ""} enviada${count > 1 ? "s" : ""} com sucesso!`,
      data: inserted,
    }
  } catch (error) {
    console.error("Erro no submitZine:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro interno do servidor",
      data: null,
    }
  }
}

