import type { ChangelogSection } from "@/content/changelog-types";
import { ChangelogEntryView } from "./changelog-entry";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function ChangelogSectionView({ section }: { section: ChangelogSection }) {
  const isUnreleased = !section.releasedAt;

  return (
    <section className="mb-12" aria-labelledby={`changelog-${section.title}`}>
      <h2
        id={`changelog-${section.title}`}
        className="mb-5 border-b-2 border-black pb-2 text-xl font-bold"
      >
        {isUnreleased || !section.releasedAt
          ? "Não publicado"
          : formatDate(section.releasedAt)}
      </h2>
      <div>
        {section.entries.map((entry) => (
          <ChangelogEntryView key={`${section.title}-${entry.title}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}
