import Link from "next/link";
import type { ReactNode } from "react";
import type { ChangelogEntry } from "@/content/changelog-types";

const kindLabels = {
  added: "Adicionado",
  changed: "Alterado",
  deprecated: "Descontinuado",
  removed: "Removido",
  fixed: "Corrigido",
  security: "Segurança",
} as const;

function renderTechnicalTerms(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-900"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

export function ChangelogEntryView({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="border-t border-neutral-200 py-6 first:border-t-0 first:pt-0">
      <div className="mb-2 text-sm text-neutral-500">{kindLabels[entry.kind]}</div>
      <h3 className="mb-2 text-lg font-semibold">{entry.title}</h3>
      <p className="leading-relaxed text-neutral-700">
        {renderTechnicalTerms(entry.summary)}
      </p>
      {entry.references.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {entry.references.map((reference) => (
            <Link
              key={`${reference.url}-${reference.label}`}
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:bg-blue-50 hover:text-blue-900"
            >
              {reference.label}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
