import "server-only";

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

export async function createPublicationEmailModule() {
  const admin = await getPublicationEmailAdmin();
  if (!admin) throw new Error("Apenas administradores podem enviar notificações.");
  const key = process.env.RESEND_API_KEY;
  const from = process.env.PUBLICATION_EMAIL_FROM;
  const replyTo = process.env.PUBLICATION_EMAIL_REPLY_TO;
  if (!key || !from || !replyTo) throw new Error("O envio de e-mails ainda não foi configurado.");

  return createPublicationEmailService(
    createPublicationEmailRepository(createAdminClient()),
    createResendPublicationEmailSender(key),
    { from, replyTo, siteUrl: siteConfig.url, signingKey: key, adminId: admin.id },
  );
}
