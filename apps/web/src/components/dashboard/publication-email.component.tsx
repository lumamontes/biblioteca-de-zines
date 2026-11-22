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
  PublicationEmailRecipient,
} from "@/application/publication-email/publication-email.types";

export function PublicationEmailPanel({ zineId }: { zineId: number }) {
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
          const result = await loadPublicationEmailRecipients(zineId);
          if (result.ok) setPublication(result.data);
          else setError(result.error);
        });
      }}>E-mails da publicação</Button>
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
                      setAddress("");
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
            const result = await previewPublicationEmail(zineId, selection.id, address);
            if (result.ok) setPreview(result.data);
            else setError(result.error);
          });
        }}>
          <label className="block break-words">
            E-mail de {selection.name}
            <input className="mt-1 block w-full rounded border border-gray-400 p-2"
              type="email" required maxLength={254} disabled={pending}
              value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
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
                  zineId, selection.id, preview.message.to, preview.token,
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
                  const refreshed = await loadPublicationEmailRecipients(zineId);
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
