"use server";

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

export async function loadPublicationEmailRecipients(zineId: number) {
  return run(async () => (await createPublicationEmailModule()).recipients(zineId));
}

export async function previewPublicationEmail(zineId: number, authorId: number, address: string) {
  return run(async () => (await createPublicationEmailModule()).preview(zineId, authorId, address));
}

export async function confirmPublicationEmail(zineId: number, authorId: number, address: string, token: string) {
  return run(async () => (await createPublicationEmailModule()).confirm(zineId, authorId, address, token));
}
