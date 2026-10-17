import Link from "next/link";
import type { ChangelogEntry } from "@/content/changelog-types";

const kindLabels = {
  added: "Adicionado",
  changed: "Alterado",
  deprecated: "Descontinuado",
  removed: "Removido",
  fixed: "Corrigido",
  security: "Segurança",
} as const;

export function ChangelogEntryView({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="border-t border-neutral-200 py-6 first:border-t-0 first:pt-0">
      <div className="mb-2 text-sm text-neutral-500">{kindLabels[entry.kind]}</div>
      <h3 className="mb-2 text-lg font-semibold">{entry.title}</h3>
      <p className="leading-relaxed text-neutral-700">{entry.summary}</p>
      {entry.references.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {entry.references.map((reference) => (
            <Link
              key={`${reference.url}-${reference.label}`}
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {reference.label}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
