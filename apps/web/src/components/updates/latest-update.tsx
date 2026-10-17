import type { Update } from "@/content/update-types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function LatestUpdate({ update }: { update: Update }) {
  if (!update.public) return null;

  return (
    <aside className="mb-10 border-l-4 border-black bg-neutral-50 p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Última novidade · {formatDate(update.date)}
      </p>
      <h2 className="mb-2 text-xl font-bold">{update.public.title}</h2>
      <p className="leading-relaxed text-neutral-700">{update.public.summary}</p>
    </aside>
  );
}
