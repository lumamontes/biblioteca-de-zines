import type { Update } from "@/content/update-types";

export function formatNovidadeDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function getFeaturedNovidade(updates: Update[]): Update | undefined {
  return updates.find((update) => update.slug === "visualizador-de-paginas-de-zines") ?? updates[0];
}

export function getNovidadeMedia(update: Update): NonNullable<NonNullable<Update["public"]>["media"]> {
  return update.public?.media ?? [];
}
