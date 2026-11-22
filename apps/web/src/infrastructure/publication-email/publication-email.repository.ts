import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createPublicationEmailRepository(db: SupabaseClient<Database>) {
  return {
    async publication(zineId: number) {
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
    async history(zineId: number) {
      const { data, error } = await db.from("publication_emails")
        .select("author_id, recipient, sent_at").eq("zine_id", zineId);
      if (error) throw error;
      return data;
    },
    async reserve(zineId: number, authorId: number, recipient: string) {
      const { error } = await db.from("publication_emails")
        .insert({ zine_id: zineId, author_id: authorId, recipient });
      if (error?.code === "23505") throw new Error("Já existe um envio registrado para esta autoria.");
      if (error) throw error;
    },
    async release(zineId: number, authorId: number) {
      const { error } = await db.from("publication_emails").delete()
        .eq("zine_id", zineId).eq("author_id", authorId).is("sent_at", null);
      if (error) throw error;
    },
    async complete(zineId: number, authorId: number, providerId: string) {
      const sentAt = new Date().toISOString();
      const { error } = await db.from("publication_emails")
        .update({ provider_id: providerId, sent_at: sentAt })
        .eq("zine_id", zineId).eq("author_id", authorId)
        .is("sent_at", null).select("sent_at").single();
      if (error) throw error;
      return sentAt;
    },
  };
}
