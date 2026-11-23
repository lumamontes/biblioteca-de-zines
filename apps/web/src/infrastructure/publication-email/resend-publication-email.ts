import type { PublicationEmail } from "@/application/publication-email/publication-email.types";

export function createResendPublicationEmailSender(key: string) {
  return async (message: PublicationEmail, attemptKey: string) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `biblioteca-publication/${attemptKey}`,
      },
      redirect: "error",
      body: JSON.stringify({
        from: message.from,
        reply_to: message.replyTo,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 429) return { status: "rejected", reason: "rate-limit" } as const;
    if ([401, 403].includes(response.status)) return { status: "rejected", reason: "configuration" } as const;
    if ([400, 422].includes(response.status)) return { status: "rejected", reason: "recipient" } as const;
    if (!response.ok) throw new Error("O provedor não confirmou o envio.");
    const result = await response.json();
    if (typeof result.id !== "string" || !result.id) throw new Error("Envio sem identificador.");
    return { status: "accepted", id: result.id } as const;
  };
}
