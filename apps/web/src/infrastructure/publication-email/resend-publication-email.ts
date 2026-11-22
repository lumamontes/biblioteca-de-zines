import type { PublicationEmail } from "@/application/publication-email/publication-email.types";

export function createResendPublicationEmailSender(key: string) {
  return async (message: PublicationEmail) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: message.from,
        reply_to: message.replyTo,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if ([400, 401, 403, 422, 429].includes(response.status)) {
      return { status: "rejected" } as const;
    }
    if (!response.ok) throw new Error("O provedor não confirmou o envio.");
    const result = await response.json();
    if (typeof result.id !== "string" || !result.id) throw new Error("Envio sem identificador.");
    return { status: "accepted", id: result.id } as const;
  };
}
