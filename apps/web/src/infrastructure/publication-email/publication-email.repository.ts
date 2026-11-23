import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublicationEmailKind, PublicationEmailRepository } from "@/application/publication-email/publication-email.types";
import { parseUploadAuthors } from "@/utils/authors";
import type { Database } from "@/types/database.types";

export function createPublicationEmailRepository(
  db: SupabaseClient<Database>,
  template: PublicationEmailKind,
): PublicationEmailRepository {
  function target(id: number) {
    return template === "invalid-link" ? { upload_id: id, template } : { zine_id: id, template };
  }

  function recipientTarget(id: number, authorId: number) {
    return template === "invalid-link" ? target(id) : { ...target(id), author_id: authorId };
  }

  return {
    async publication(zineId: number) {
      if (template === "invalid-link") {
        const { data, error } = await db.from("form_uploads")
          .select("title, pdf_url, author_name, author_url")
          .eq("id", zineId).single();
        if (error) throw error;
        const names = parseUploadAuthors(data).map(({ name }) => name).join(", ");
        return {
          title: data.title,
          slug: "",
          sourceUrl: data.pdf_url,
          authors: [{ id: zineId, name: names || "pessoa responsável pela inscrição" }],
        };
      }

      const [publication, links] = await Promise.all([
        db.from("library_zines").select("title, slug")
          .eq("id", zineId).eq("is_published", true).maybeSingle(),
        db.from("library_zines_authors").select("authors!fk_authors(id, name)")
          .eq("zine_id", zineId),
      ]);
      if (publication.error) throw publication.error;
      if (links.error) throw links.error;
      if (!publication.data?.slug) throw new Error("A zine precisa estar publicada.");
      const authors = new Map(links.data.flatMap(({ authors }) =>
        authors ? [[authors.id, authors] as const] : []));
      return {
        title: publication.data.title,
        slug: publication.data.slug,
        authors: [...authors.values()],
      };
    },
    async history(id) {
      const { data, error } = await db.from("publication_emails")
        .select("author_id, recipient, sent_at, from_address, reply_to, subject, body")
        .match(target(id));
      if (error) throw error;
      return data.map(({ author_id, recipient, sent_at, from_address, reply_to, subject, body }) => ({
        authorId: author_id ?? id,
        recipient,
        sentAt: sent_at,
        message: from_address !== null && reply_to !== null && subject !== null && body !== null
          ? { from: from_address, replyTo: reply_to, to: recipient, subject, text: body }
          : undefined,
      }));
    },
    async reserve(id, authorId, message) {
      const { error } = await db.from("publication_emails").insert({
        ...recipientTarget(id, authorId),
        recipient: message.to,
        from_address: message.from,
        reply_to: message.replyTo,
        subject: message.subject,
        body: message.text,
      });
      if (error?.code === "23505") throw new Error("Já existe um envio registrado para esta mensagem.");
      if (error) throw error;
    },
    async release(id, authorId) {
      const { error } = await db.from("publication_emails").delete()
        .match(recipientTarget(id, authorId)).is("sent_at", null);
      if (error) throw error;
    },
    async complete(id, authorId, providerId) {
      const sentAt = new Date().toISOString();
      const { error } = await db.from("publication_emails")
        .update({ provider_id: providerId, sent_at: sentAt })
        .match(recipientTarget(id, authorId))
        .is("sent_at", null).select("sent_at").single();
      if (error) throw error;
      return sentAt;
    },
  };
}
