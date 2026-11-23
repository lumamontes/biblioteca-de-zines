import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublicationEmailRepository } from "@/application/publication-email/publication-email.types";
import type { Database } from "@/types/database.types";
import { parseUploadAuthors } from "@/utils/authors";

export function createSubmissionReviewEmailRepository(
  db: SupabaseClient<Database>,
): PublicationEmailRepository {
  return {
    async publication(uploadId) {
      const { data, error } = await db.from("form_uploads")
        .select("title, pdf_url, author_name, author_url")
        .eq("id", uploadId).single();
      if (error) throw error;

      const names = parseUploadAuthors(data).map(({ name }) => name).join(", ");
      return {
        title: data.title,
        slug: "",
        sourceUrl: data.pdf_url,
        authors: [{ id: uploadId, name: names || "pessoa responsável pela inscrição" }],
      };
    },
    async history(uploadId) {
      const { data, error } = await db.from("submission_review_emails")
        .select("recipient, sent_at").eq("upload_id", uploadId);
      if (error) throw error;
      return data.map((record) => ({ ...record, author_id: uploadId }));
    },
    async reserve(uploadId, _contactId, recipient) {
      const { error } = await db.from("submission_review_emails")
        .insert({ upload_id: uploadId, recipient });
      if (error?.code === "23505") throw new Error("Já existe um pedido de novo link para esta inscrição.");
      if (error) throw error;
    },
    async release(uploadId) {
      const { error } = await db.from("submission_review_emails").delete()
        .eq("upload_id", uploadId).is("sent_at", null);
      if (error) throw error;
    },
    async complete(uploadId, _contactId, providerId) {
      const sentAt = new Date().toISOString();
      const { error } = await db.from("submission_review_emails")
        .update({ provider_id: providerId, sent_at: sentAt })
        .eq("upload_id", uploadId).is("sent_at", null).select("sent_at").single();
      if (error) throw error;
      return sentAt;
    },
  };
}
