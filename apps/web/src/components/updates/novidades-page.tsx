import Image from "next/image";
import Link from "next/link";
import type { Update } from "@/content/update-types";
import { novidadesKindLabels } from "./novidades-config";
import { formatNovidadeDate, getFeaturedNovidade, getNovidadeMedia } from "./novidades-content";
import { NovidadesLab } from "./novidades-lab";

export function NovidadesPage({ updates }: { updates: Update[] }) {
  const featured = getFeaturedNovidade(updates);
  const communityUpdates = updates.filter((update) => update.kind === "community");
  const archiveUpdates = updates.filter((update) => update.historic && update !== featured);

  if (!featured) return null;

  return (
    <div className="-mx-4 min-h-screen bg-[#f5f2e9] text-black sm:-mx-8">
      <section className="border-b-2 border-black bg-[#ff6b4a] px-4 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em]">Novidades da Biblioteca</p>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.92] tracking-[-0.05em] sm:text-7xl">
              O acervo está sempre em movimento.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
              Aqui você acompanha as mudanças que tornam as zines mais fáceis de encontrar, ler e cuidar.
            </p>
          </div>
          <NovidadesLab />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">Agora</p>
            <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight sm:text-4xl">Uma nova maneira de virar as páginas.</h2>
            <p className="mt-5 max-w-sm leading-relaxed text-neutral-700">{featured.public?.summary}</p>
            <p className="mt-5 font-mono text-xs text-neutral-500">{formatNovidadeDate(featured.date)}</p>
          </div>
          <article className="grid overflow-hidden border-2 border-black bg-white md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[280px] bg-[#b8a7ff] md:min-h-[420px]">
              {getNovidadeMedia(featured)[0] && (
                <Image
                  src={getNovidadeMedia(featured)[0].src}
                  alt={getNovidadeMedia(featured)[0].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover p-5 mix-blend-multiply"
                />
              )}
            </div>
            <div className="flex flex-col justify-between border-t-2 border-black p-6 md:border-l-2 md:border-t-0 md:p-8">
              <div>
                <span className="inline-block border border-black bg-[#d7ff3f] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em]">Em preparação</span>
                <h3 className="mt-6 text-2xl font-bold leading-tight">{featured.public?.title}</h3>
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-neutral-700">
                  {featured.public?.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
              <p className="mt-8 border-t border-black pt-4 font-mono text-xs text-neutral-600">O PDF continua sendo a referência. A novidade é o caminho até ele.</p>
            </div>
          </article>
        </div>
      </section>

      {communityUpdates.length > 0 && (
        <section className="border-y-2 border-black bg-black px-4 py-12 text-[#f5f2e9] sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-[0.65fr_1.35fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#d7ff3f]">Fora da tela</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">A Biblioteca também acontece em encontros.</h2>
                <p className="mt-5 max-w-sm leading-relaxed text-neutral-300">Oficinas, conversas e circulação fazem parte de como o acervo continua vivo.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {communityUpdates.map((update) => {
                  const media = getNovidadeMedia(update);
                  return (
                    <article key={update.slug} className="border border-neutral-600 bg-neutral-950 p-3">
                      {media[0] && <Image src={media[0].src} alt={media[0].alt} width={720} height={480} className="aspect-[3/2] w-full object-cover" />}
                      <div className="p-3">
                        <p className="font-mono text-[11px] text-[#d7ff3f]">{formatNovidadeDate(update.date)}</p>
                        <h3 className="mt-2 text-xl font-bold">{update.public?.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-300">{update.public?.summary}</p>
                        {update.public?.sourceUrl && <Link href={update.public.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm underline decoration-[#d7ff3f] underline-offset-4">Ver registro</Link>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-black pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">Linha do tempo</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Mudanças que ficam.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-600">Do primeiro catálogo aos filtros, páginas de autoria e cuidados com os arquivos.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {archiveUpdates.map((update, index) => {
            const media = getNovidadeMedia(update);
            return (
              <article key={update.slug} className="grid gap-5 border-b border-black pb-6 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="relative min-h-40 overflow-hidden border border-black bg-white">
                  {media[0] && <Image src={media[0].src} alt={media[0].alt} fill sizes="(max-width: 640px) 100vw, 30vw" className="object-cover" />}
                  <span className="absolute left-2 top-2 border border-black bg-[#d7ff3f] px-2 py-1 font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <p className="font-mono text-xs text-neutral-500">{formatNovidadeDate(update.date)} · {novidadesKindLabels[update.kind]}</p>
                  <h3 className="mt-2 text-xl font-bold leading-tight">{update.public?.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">{update.public?.summary}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
