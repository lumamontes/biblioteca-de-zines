import Image from "next/image";
import Link from "next/link";
import type { Update } from "@/content/update-types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function PublicUpdate({ update }: { update: Update }) {
  if (!update.public) return null;

  return (
    <article className="border-t border-neutral-200 py-8 first:border-t-0 first:pt-0">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time dateTime={update.date} className="text-sm text-neutral-500">
          {formatDate(update.date)}
        </time>
        {update.historic && (
          <span className="text-sm text-neutral-500">· histórico</span>
        )}
      </div>
      <h2 className="mb-3 text-2xl font-bold">{update.public.title}</h2>
      <p className="mb-4 text-lg leading-relaxed">{update.public.summary}</p>
      <div className="space-y-3 leading-relaxed text-neutral-700">
        {update.public.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {update.public.media && update.public.media.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {update.public.media.map((media) =>
            media.kind === "image" ? (
              <figure key={media.src}>
                <Image
                  src={media.src}
                  alt={media.alt}
                  width={800}
                  height={800}
                  className="h-full w-full object-cover"
                />
                {media.caption && (
                  <figcaption className="mt-1 text-xs text-neutral-500">
                    {media.caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <a
                key={media.src}
                href={media.src}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-32 items-center justify-center bg-neutral-100 p-3 text-center text-sm underline"
              >
                Assistir vídeo: {media.alt}
              </a>
            ),
          )}
        </div>
      )}
      {update.public.sourceUrl && (
        <Link
          href={update.public.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block text-sm underline"
        >
          {update.public.sourceLabel ?? "Ver publicação original"}
        </Link>
      )}
    </article>
  );
}
