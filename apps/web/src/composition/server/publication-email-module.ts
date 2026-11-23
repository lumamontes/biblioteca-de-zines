import "server-only";

import type { PublicationEmailKind } from "@/application/publication-email/publication-email.types";
import { createSubmissionReviewEmailRepository } from "@/infrastructure/publication-email/submission-review-email.repository";
import { siteConfig } from "@/app/config/site";
import { createPublicationEmailService } from "@/application/publication-email/publication-email.service";
import { createPublicationEmailRepository } from "@/infrastructure/publication-email/publication-email.repository";
import { createResendPublicationEmailSender } from "@/infrastructure/publication-email/resend-publication-email";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function getPublicationEmailAdmin() {
  const { data, error } = await (await createClient()).auth.getUser();
  return !error && data.user?.app_metadata.role === "admin" ? data.user : null;
}

export async function createPublicationEmailModule(kind: PublicationEmailKind = "published") {
  const admin = await getPublicationEmailAdmin();
  if (!admin) throw new Error("Apenas administradores podem enviar notificações.");
  const key = process.env.RESEND_API_KEY;
  const from = process.env.PUBLICATION_EMAIL_FROM;
  const replyTo = process.env.PUBLICATION_EMAIL_REPLY_TO;
  if (!key || !from || !replyTo) throw new Error("O envio de e-mails ainda não foi configurado.");

  if (kind !== "published" && kind !== "invalid-link") throw new Error("Tipo de e-mail inválido.");
  const client = createAdminClient();
  const repository = kind === "invalid-link"
    ? createSubmissionReviewEmailRepository(client)
    : createPublicationEmailRepository(client);

  return createPublicationEmailService(
    repository,
    createResendPublicationEmailSender(key),
    { from, replyTo, siteUrl: siteConfig.url, signingKey: key, adminId: admin.id, kind },
  );
}
