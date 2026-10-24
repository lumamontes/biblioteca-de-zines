'use client';

import { useRouter } from 'next/navigation';
import { ZineReadingLayout } from './zine-reading-layout';
import type { ZineUnavailableReadingSurfaceProps } from './zine-unavailable-reading-surface.types';

export function ZineUnavailableReadingSurface({ sidebar, sidebarHeader, surface }: ZineUnavailableReadingSurfaceProps) {
  const router = useRouter();

  return (
    <section className="w-full lg:h-full">
      <ZineReadingLayout sidebarHeader={sidebarHeader} sidebar={sidebar}>
        <div className="flex h-[min(72vh,56rem)] min-h-[32rem] items-center justify-center border border-neutral-200 bg-white p-6 text-center" role="alert">
          <div className="max-w-xl space-y-4">
            <p className="text-lg font-semibold">Opa, parece que o link para essa zine não está mais disponível!</p>
            <p className="text-sm leading-6">Tente novamente mais tarde. Entre em contato com a gente.</p>
            <button className="border border-black bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-white hover:text-black" onClick={() => router.refresh()} type="button">Tentar novamente</button>
            <a
              className="ml-2 inline-block border border-black px-4 py-2 text-xs font-semibold hover:bg-black hover:text-white"
              href={`mailto:bibliotecadezines@gmail.com?subject=${encodeURIComponent(`Link indisponível: ${surface.title}`)}&body=${encodeURIComponent(`Olá, Biblioteca de Zines!\n\nO link da zine "${surface.title}" está indisponível. Gostaria de ajudar a atualizar essa publicação.\n\nObrigada!`)}`}
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
