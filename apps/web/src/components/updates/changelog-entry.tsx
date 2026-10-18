import Link from "next/link";
import type { ChangelogEntry } from "@/content/changelog-types";
import { changelogKindPresentation } from "./changelog-entry-config";
import { renderChangelogSummary } from "./changelog-entry-content";

export function ChangelogEntryView({ entry }: { entry: ChangelogEntry }) {
  const kind = changelogKindPresentation[entry.kind];

  return (
    <article className="border-t border-neutral-200 py-6 first:border-t-0 first:pt-0">
      <div
        className={`mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${kind.className}`}
      >
        {kind.label}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{entry.title}</h3>
      <p className="leading-relaxed text-neutral-700">
        {renderChangelogSummary(entry.summary)}
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
