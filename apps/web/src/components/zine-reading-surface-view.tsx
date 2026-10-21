'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { hasBetaReadingSurface } from '@/application/reader/reading-surface';
import { PdfReadingLayout } from './pdf-reading-layout';
import { ZineReaderOptions } from './zine-reader-options';
import { ZineReadingLayout } from './zine-reading-layout';
import type { ZineReadingSurfaceViewProps } from './zine-reading-surface-view-types';

export function ZineReadingSurfaceView({ initialMode, sidebar, sidebarHeader, surface }: ZineReadingSurfaceViewProps) {
  if (surface.availability === 'unavailable') return <UnavailableSurface sidebar={sidebar} sidebarHeader={sidebarHeader} title={surface.title} />;
  if (hasBetaReadingSurface(surface)) return <ZineReaderOptions initialMode={initialMode} sidebar={sidebar} sidebarHeader={sidebarHeader} surface={surface} />;
  return <PdfReadingLayout sidebar={sidebar} sidebarHeader={sidebarHeader} url={surface.pdfUrl} />;
}

function UnavailableSurface({ sidebar, sidebarHeader, title }: { sidebar: ReactNode; sidebarHeader: ReactNode; title: string }) {
  const router = useRouter();

  return (
    <section className="w-full lg:h-full">
      <ZineReadingLayout sidebarHeader={sidebarHeader} sidebar={sidebar}>
        <div className="flex h-[min(72vh,56rem)] min-h-[32rem] items-center justify-center border border-neutral-200 bg-white p-6 text-center" role="alert">
          <div className="max-w-xl space-y-4">
            <p className="text-lg font-semibold">Opa, parece que o link para essa zine não está mais disponível!</p>
            <p className="text-sm leading-6">Tente novamente mais tarde. Se você é a pessoa autora da zine, entre em contato com a gente para que possamos resolver isso.</p>
            <button className="border border-black bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-white hover:text-black" onClick={() => router.refresh()} type="button">Tentar novamente</button>
            <p className="text-xs text-neutral-500">{title}</p>
          </div>
        </div>
      </ZineReadingLayout>
    </section>
  );
}
