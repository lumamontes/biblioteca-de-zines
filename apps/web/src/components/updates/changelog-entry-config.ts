import type { ChangelogKind } from "@/content/changelog-types";

export const changelogKindPresentation: Record<
  ChangelogKind,
  { label: string; className: string }
> = {
  added: {
    label: "Adicionado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  changed: {
    label: "Alterado",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  deprecated: {
    label: "Descontinuado",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  removed: {
    label: "Removido",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  fixed: {
    label: "Corrigido",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  security: {
    label: "Segurança",
    className: "border-orange-200 bg-orange-50 text-orange-800",
  },
};
