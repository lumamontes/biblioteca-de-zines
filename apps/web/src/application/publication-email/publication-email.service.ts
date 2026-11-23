import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
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
    return message;
  }

  function sign(zineId: number, authorId: number, message: PublicationEmail, confirmation: string) {
    return createHmac("sha256", config.signingKey)
      .update(JSON.stringify([config.adminId, config.kind ?? "published", zineId, authorId, message, confirmation]))
      .digest("hex");
  }

  return {
    async recipients(zineId: number) {
      const [publication, history] = await Promise.all([
        repository.publication(zineId), repository.history(zineId),
      ]);
      return {
        title: publication.title,
        authors: publication.authors.map((author) => {
          const record = history.find(({ authorId }) => authorId === author.id);
          return {
            ...author,
            history: record && { recipient: record.recipient, sentAt: record.sentAt, message: record.message, rejection: record.rejection },
          };
        }),
      };
    },
    async preview(zineId: number, authorId: number, address: string) {
      const message = await draft(zineId, authorId, address);
      const expiresAt = Date.now() + 10 * 60_000;
      const confirmation = `${randomUUID()}.${expiresAt}`;
      return { message, token: `${confirmation}.${sign(zineId, authorId, message, confirmation)}` };
    },
    async confirm(zineId: number, authorId: number, address: string, token: string) {
      const parts = typeof token === "string"
        ? /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.(\d{13})\.([a-f0-9]{64})$/.exec(token)
        : null;
      if (!parts || Number(parts[2]) <= Date.now()) {
        throw new Error("A prévia expirou ou é inválida. Abra uma nova prévia antes de enviar.");
      }
      const [, attemptKey, expiresAt, signature] = parts;
      const message = await draft(zineId, authorId, address);
      const expected = sign(zineId, authorId, message, `${attemptKey}.${expiresAt}`);
      if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
        throw new Error("A mensagem mudou. Abra uma nova prévia antes de enviar.");
      }
      if (Number(expiresAt) <= Date.now()) {
        throw new Error("A prévia expirou. Abra uma nova prévia antes de enviar.");
      }

      await repository.reserve(zineId, authorId, message, attemptKey);
      let rejection;
      try {
        const result = await send(message, attemptKey);
        if (result.status === "accepted") {
          return {
            recipient: message.to,
            sentAt: await repository.complete(attemptKey, result.id),
            message,
          };
        }
        await repository.reject(attemptKey, result.reason);
        rejection = result.reason;
      } catch {
        // Keep the reservation when provider acceptance or persistence is uncertain.
        throw new Error("Envio sem confirmação. Consulte o Resend antes de tentar novamente.");
      }
      const errors = {
        recipient: "O Resend recusou o envio. Confira o endereço antes de abrir uma nova prévia.",
        configuration: "O Resend recusou o envio. Confira a configuração do remetente antes de tentar novamente.",
        "rate-limit": "O Resend limitou os envios. Aguarde antes de abrir uma nova prévia.",
      };
      throw new Error(errors[rejection]);
    },
  };
}
