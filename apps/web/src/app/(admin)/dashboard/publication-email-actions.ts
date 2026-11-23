"use server";

import type { PublicationEmailKind } from "@/application/publication-email/publication-email.types";
import { createPublicationEmailModule } from "@/composition/server/publication-email-module";

async function run<T>(operation: () => Promise<T>) {
  try {
    return { ok: true, data: await operation() } as const;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível consultar o envio.",
    } as const;
  }
}

export async function loadPublicationEmailRecipients(zineId: number, kind: PublicationEmailKind) {
  return run(async () => (await createPublicationEmailModule(kind)).recipients(zineId));
}

export async function previewPublicationEmail(zineId: number, authorId: number, address: string, kind: PublicationEmailKind) {
  return run(async () => (await createPublicationEmailModule(kind)).preview(zineId, authorId, address));
}

export async function confirmPublicationEmail(zineId: number, authorId: number, address: string, token: string, kind: PublicationEmailKind) {
  return run(async () => (await createPublicationEmailModule(kind)).confirm(zineId, authorId, address, token));
}
