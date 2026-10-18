'use client';

import Link from 'next/link';
import { Download, ExternalLink, Maximize2, MoreHorizontal, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import type { ZineReaderToolbarProps } from './zine-reader-toolbar-types';

export function ZineReaderToolbar({ downloadUrl, embedCustomizer, mobileEmbedCustomizer, onFullscreen, viewerUrl }: ZineReaderToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="mb-3 flex items-center justify-end border-y border-neutral-200 py-3 text-xs font-semibold">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {embedCustomizer}
        <a className="inline-flex h-9 flex-1 items-center justify-center gap-2 border border-black px-3 hover:bg-neutral-100 sm:flex-none" href={downloadUrl} rel="noreferrer" target="_blank">
          <Download aria-hidden="true" size={15} />
          Baixar PDF
        </a>
        <Link className="hidden h-9 items-center gap-2 border border-black px-3 hover:bg-neutral-100 sm:inline-flex" href={viewerUrl} rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={15} />
          Abrir em nova aba
        </Link>
        <button className="inline-flex h-9 flex-1 items-center justify-center gap-2 border border-black px-3 hover:bg-neutral-100 sm:flex-none" onClick={onFullscreen} type="button">
          <Maximize2 aria-hidden="true" size={15} />
          Tela cheia
        </button>
        <button aria-label="Mais ações" className="inline-flex h-9 flex-1 items-center justify-center gap-2 border border-black px-3 hover:bg-neutral-100 sm:hidden" onClick={() => setMoreOpen(true)} type="button">
          <MoreHorizontal aria-hidden="true" size={17} />
          Mais
        </button>
      </div>
      {moreOpen && createPortal(
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 sm:hidden" onClick={() => setMoreOpen(false)} role="presentation">
          <div className="w-full rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <p className="text-base font-semibold">Mais ações</p>
              <button aria-label="Fechar mais ações" className="flex size-9 items-center justify-center border border-black" onClick={() => setMoreOpen(false)} type="button">
                <X aria-hidden="true" size={17} />
              </button>
            </div>
            <div className="grid gap-2 text-sm font-semibold">
              <Link className="inline-flex h-11 items-center gap-2 border border-black px-3" href={viewerUrl} rel="noreferrer" target="_blank">
                <ExternalLink aria-hidden="true" size={16} />
                Abrir em nova aba
              </Link>
              {mobileEmbedCustomizer}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
