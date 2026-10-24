import { ZineReadingLayout } from './zine-reading-layout';
import type { ZineUnavailableReadingSurfaceProps } from './zine-unavailable-reading-surface.types';

export function ZineUnavailableReadingSurface({ sidebar, sidebarHeader, surface }: ZineUnavailableReadingSurfaceProps) {
  return (
    <section className="w-full lg:h-full">
      <ZineReadingLayout sidebarHeader={sidebarHeader} sidebar={sidebar}>
        <div className="flex h-[min(72vh,56rem)] min-h-[32rem] items-center justify-center border border-neutral-200 bg-white p-6 text-center lg:h-full" role="alert">
          <div className="max-w-xl space-y-4">
            <p className="text-lg font-semibold">Opa, parece que o link para essa zine não está mais disponível!</p>
            <p className="text-sm leading-6">Tente novamente mais tarde. Se você é a pessoa autora da zine, entre em contato com a gente.</p>
            <a
              className="inline-block border border-black px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white"
              href={`mailto:bibliotecadezines@gmail.com?subject=${encodeURIComponent(`Link indisponível: ${surface.title}`)}&body=${encodeURIComponent(`Olá, Biblioteca de Zines!\n\nO link da zine "${surface.title}" está indisponível.\n\nNovo link correto: \n\nObrigada!`)}`}
            >
              Entrar em contato por email
            </a>
            <p className="text-xs text-neutral-500">{surface.title}</p>
          </div>
        </div>
      </ZineReadingLayout>
    </section>
  );
}
