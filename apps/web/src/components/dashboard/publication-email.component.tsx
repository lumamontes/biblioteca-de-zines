"use client";

import { useState, useTransition } from "react";
import Button from "../button";
import {
  confirmPublicationEmail,
  loadPublicationEmailRecipients,
  previewPublicationEmail,
} from "@/app/(admin)/dashboard/publication-email-actions";
import type {
  PublicationEmail,
  PublicationEmailKind,
  PublicationEmailRecipient,
} from "@/application/publication-email/publication-email.types";

export function PublicationEmailPanel({
  id,
  kind,
  submissionEmail,
}: {
  id: number;
  kind: PublicationEmailKind;
  submissionEmail: string | null;
}) {
  const contactEmail = submissionEmail?.trim() ?? "";
  const [publication, setPublication] = useState<{ title: string; authors: PublicationEmailRecipient[] }>();
  const [selection, setSelection] = useState<PublicationEmailRecipient>();
  const [address, setAddress] = useState("");
  const [preview, setPreview] = useState<{ message: PublicationEmail; token: string }>();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-3 rounded border border-gray-300 p-3 text-sm">
      <Button disabled={pending} onClick={() => {
        setError("");
        setSelection(undefined);
        setPreview(undefined);
        startTransition(async () => {
          const result = await loadPublicationEmailRecipients(id, kind);
          if (result.ok) setPublication(result.data);
          else setError(result.error);
        });
      }}>{kind === "invalid-link" ? "Link inválido" : "E-mails da publicação"}</Button>
      {publication && (
        <>
          <p className="font-semibold break-words">{publication.title}</p>
          {publication.authors.length === 0 && <p>Nenhuma autoria vinculada.</p>}
          <ul className="space-y-3">
            {publication.authors.map((author) => (
              <li key={author.id} className="space-y-1 break-words">
                <p className="font-medium">{author.name}</p>
                {author.history ? (
                  <p role="status">
                    {author.history.sentAt
                      ? `Enviado para ${author.history.recipient} em ${new Date(author.history.sentAt).toLocaleString("pt-BR")}`
                      : `Envio sem confirmação para ${author.history.recipient}. Consulte o Resend.`}
                  </p>
                ) : (
                  <>
                    <p>Nenhum envio registrado</p>
                    <Button disabled={pending} onClick={() => {
                      setSelection(author);
                      setAddress(publication.authors.length === 1 ? contactEmail : "");
                      setPreview(undefined);
                      setError("");
                    }}>Preparar e-mail</Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {selection && !preview && (
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          setError("");
          startTransition(async () => {
            const result = await previewPublicationEmail(id, selection.id, address, kind);
            if (result.ok) setPreview(result.data);
            else setError(result.error);
          });
        }}>
          <label className="block break-words">
            {kind === "invalid-link" ? "E-mail de contato" : `E-mail de ${selection.name}`}
            <input className="mt-1 block w-full rounded border border-gray-400 p-2"
              type="email" required maxLength={254} disabled={pending}
              value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          {contactEmail && publication && publication.authors.length > 1 && (
            <Button type="button" disabled={pending} onClick={() => setAddress(contactEmail)}>
              Usar e-mail de contato da inscrição
            </Button>
          )}
          <Button type="submit" disabled={pending}>Ver prévia</Button>
        </form>
      )}
      {selection && preview && (
        <div className="space-y-3 border-t border-gray-300 pt-3">
          <h3 className="font-semibold">Prévia do e-mail</h3>
          <dl className="space-y-1 break-words">
            <div><dt className="font-medium">De</dt><dd>{preview.message.from}</dd></div>
            <div><dt className="font-medium">Para</dt><dd>{preview.message.to}</dd></div>
            <div><dt className="font-medium">Responder a</dt><dd>{preview.message.replyTo}</dd></div>
            <div><dt className="font-medium">Assunto</dt><dd>{preview.message.subject}</dd></div>
          </dl>
          <p className="whitespace-pre-wrap break-words rounded bg-gray-100 p-3">{preview.message.text}</p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={pending} onClick={() => setPreview(undefined)}>Voltar</Button>
            <Button disabled={pending} onClick={() => {
              setError("");
              startTransition(async () => {
                const result = await confirmPublicationEmail(
                  id, selection.id, preview.message.to, preview.token, kind,
                );
                setPreview(undefined);
                setSelection(undefined);
                if (result.ok) {
                  setPublication((current) => current && ({
                    ...current,
                    authors: current.authors.map((author) => author.id === selection.id
                      ? { ...author, history: result.data }
                      : author),
                  }));
                } else {
                  setError(result.error);
                  const refreshed = await loadPublicationEmailRecipients(id, kind);
                  if (refreshed.ok) setPublication(refreshed.data);
                }
              });
            }}>Confirmar envio</Button>
          </div>
        </div>
      )}
      {pending && <p role="status">Aguarde…</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
    </section>
  );
}
