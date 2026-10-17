import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getNovidades } from "@/content/novidades";
import type { NerdChangeKind, Novidade } from "@/content/novidades-types";

export const metadata: Metadata = {
  title: "Novidades | Biblioteca de Zines",
  description:
    "Acompanhe as novidades da Biblioteca de Zines e as mudanças técnicas do projeto.",
};

const nerdLabels: Record<NerdChangeKind, string> = {
  adicionado: "Adicionado",
  alterado: "Alterado",
  descontinuado: "Descontinuado",
  removido: "Removido",
  corrigido: "Corrigido",
  seguranca: "Segurança",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function PublicEntry({ novidade }: { novidade: Novidade }) {
  if (!novidade.public) return null;

  return (
    <article className="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-mono uppercase">
        <time dateTime={novidade.date}>{formatDate(novidade.date)}</time>
        {novidade.historic && (
          <span className="bg-zine-yellow px-2 py-1">Histórico</span>
        )}
      </div>
      <h2 className="mb-3 text-2xl font-bold">{novidade.public.title}</h2>
      <p className="mb-4 text-lg leading-relaxed">{novidade.public.summary}</p>
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        {novidade.public.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {novidade.public.media && novidade.public.media.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {novidade.public.media.map((media) =>
            media.kind === "image" ? (
              <figure key={media.src}>
                <Image
                  src={media.src}
                  alt={media.alt}
                  width={800}
                  height={800}
                  className="h-auto w-full border border-black object-cover"
                />
                {media.caption && (
                  <figcaption className="mt-2 text-xs text-gray-600">
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
                className="flex min-h-40 items-center justify-center border border-black bg-gray-100 p-4 text-center font-mono text-sm underline"
              >
                Assistir vídeo: {media.alt} →
              </a>
            ),
          )}
        </div>
      )}
      {novidade.public.sourceUrl && (
        <Link
          href={novidade.public.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block font-mono text-sm underline"
        >
          {novidade.public.sourceLabel ?? "Ver publicação original"} →
        </Link>
      )}
    </article>
  );
}

function NerdEntry({ novidade }: { novidade: Novidade }) {
  if (!novidade.nerds) return null;

  return (
    <article className="border-2 border-black bg-black p-6 text-white">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-mono uppercase">
        <time dateTime={novidade.date}>{formatDate(novidade.date)}</time>
        <span className="bg-zine-green px-2 py-1 text-black">
          {nerdLabels[novidade.nerds.kind]}
        </span>
      </div>
      <h2 className="mb-3 text-2xl font-bold">
        {novidade.public?.title ?? "Atualização técnica"}
      </h2>
      <p className="mb-5 text-gray-200">{novidade.nerds.summary}</p>
      <div className="flex flex-wrap gap-3 font-mono text-sm">
        {novidade.nerds.pullRequests.map((pullRequest) => (
          <Link
            key={pullRequest.number}
            href={pullRequest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white px-3 py-2 hover:bg-white hover:text-black"
          >
            PR #{pullRequest.number} →
          </Link>
        ))}
      </div>
    </article>
  );
}

export default async function NovidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const nerdsView = params.view === "nerds";
  const entries = getNovidades(nerdsView ? "nerds" : "public");

  return (
    <div className="min-h-screen bg-zine-lightyellow px-4 py-12">
      <header className="mx-auto mb-10 max-w-4xl">
        <p className="mb-3 font-mono text-sm uppercase">Biblioteca de Zines</p>
        <h1 className="mb-4 text-4xl font-black md:text-6xl">
          {nerdsView ? "Novidades para nerds" : "Novidades"}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed">
          {nerdsView
            ? "Mudanças técnicas, PRs e decisões que fazem a Biblioteca funcionar."
            : "O que está acontecendo na Biblioteca e o que está mudando no site."}
        </p>
        <nav className="mt-6 flex flex-wrap gap-3 font-mono text-sm" aria-label="Visão das novidades">
          <Link
            href="/novidades"
            className={`border-2 border-black px-4 py-2 ${!nerdsView ? "bg-black text-white" : "bg-white"}`}
          >
            Novidades
          </Link>
          <Link
            href="/novidades?view=nerds"
            className={`border-2 border-black px-4 py-2 ${nerdsView ? "bg-black text-white" : "bg-white"}`}
          >
            Novidades para nerds
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid max-w-4xl gap-8">
        {entries.length > 0 ? (
          entries.map((novidade) =>
            nerdsView ? (
              <NerdEntry key={novidade.slug} novidade={novidade} />
            ) : (
              <PublicEntry key={novidade.slug} novidade={novidade} />
            ),
          )
        ) : (
          <p className="border-2 border-black bg-white p-6 font-mono">
            Nenhuma novidade publicada ainda.
          </p>
        )}
      </main>
    </div>
  );
}
