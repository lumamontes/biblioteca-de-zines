import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type {
  PublicationEmail,
  PublicationEmailKind,
  PublicationEmailRepository,
  PublicationEmailSender,
} from "./publication-email.types";

export function createPublicationEmailService(
  repository: PublicationEmailRepository,
  send: PublicationEmailSender,
  config: { from: string; replyTo: string; siteUrl: string; signingKey: string; adminId: string; kind?: PublicationEmailKind },
) {
  async function draft(zineId: number, authorId: number, address: string) {
    const recipient = z.string().trim().max(254).email().safeParse(address);
    if (!recipient.success) throw new Error("Informe um endereço de e-mail válido.");
    const publication = await repository.publication(zineId);
    const author = publication.authors.find(({ id }) => id === authorId);
    if (!author) throw new Error("Esta autoria não está vinculada à zine.");

    const invalidLink = config.kind === "invalid-link";
    const message: PublicationEmail = {
      from: config.from,
      replyTo: config.replyTo,
      to: recipient.data,
      subject: invalidLink
        ? "Precisamos de um novo link para sua zine"
        : "Sua zine foi publicada na Biblioteca de Zines",
      text: (invalidLink ? [
        `Olá, ${author.name}!`,
        `Não conseguimos acessar o arquivo da zine “${publication.title}”.`,
        publication.sourceUrl
          ? `Link informado na inscrição: ${publication.sourceUrl}`
          : "A inscrição não tem um link para o arquivo.",
        "Você pode responder a este e-mail com um novo link que permita o acesso ao arquivo sem solicitar permissão?",
        "Equipe Biblioteca de Zines",
      ] : [
        `Olá, ${author.name}!`,
        `Sua zine “${publication.title}” foi publicada na Biblioteca de Zines.`,
        `Leia a zine: ${config.siteUrl}/zines/${encodeURIComponent(publication.slug)}`,
        "Se tiver dúvidas, responda a este e-mail.",
        "Equipe Biblioteca de Zines",
      ]).join("\n\n"),
    };
    const token = createHmac("sha256", config.signingKey)
      .update(JSON.stringify([config.adminId, config.kind ?? "published", zineId, authorId, message])).digest("hex");
    return { message, token };
  }

  return {
    async recipients(zineId: number) {
      const [publication, history] = await Promise.all([
        repository.publication(zineId), repository.history(zineId),
      ]);
      return {
        title: publication.title,
        authors: publication.authors.map((author) => {
          const record = history.find(({ author_id }) => author_id === author.id);
          return {
            ...author,
            history: record && { recipient: record.recipient, sentAt: record.sent_at },
          };
        }),
      };
    },
    preview: draft,
    async confirm(zineId: number, authorId: number, address: string, token: string) {
      const preview = await draft(zineId, authorId, address);
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token) ||
        !timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(preview.token, "hex"))) {
        throw new Error("A mensagem mudou. Abra uma nova prévia antes de enviar.");
      }

      await repository.reserve(zineId, authorId, preview.message.to);
      try {
        const result = await send(preview.message);
        if (result.status === "accepted") {
          return { recipient: preview.message.to, sentAt: await repository.complete(zineId, authorId, result.id) };
        }
        await repository.release(zineId, authorId);
      } catch {
        // Keep the reservation when provider acceptance or persistence is uncertain.
        throw new Error("Envio sem confirmação. Consulte o Resend antes de tentar novamente.");
      }
      throw new Error("O Resend recusou o envio. Confira o endereço e a configuração de envio.");
    },
  };
}
