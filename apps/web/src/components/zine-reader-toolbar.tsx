'use client';

import Link from 'next/link';
import { ExternalLink, Maximize2 } from 'lucide-react';
import type { ZineReaderToolbarProps } from './zine-reader-toolbar-types';

export function ZineReaderToolbar({ embedCustomizer, onFullscreen, originalUrl, viewerUrl }: ZineReaderToolbarProps) {
  return (
    <div className="border-t border-neutral-200 pt-5 text-xs font-semibold">
      <p className="mb-3 text-xs uppercase tracking-[0.12em] text-neutral-500">Ações da leitura</p>
      <div className="grid gap-2">
        {embedCustomizer}
        <Link className="inline-flex min-h-9 items-center gap-2 border border-black px-3 hover:bg-neutral-100" href={originalUrl} rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={15} />
          Abrir arquivo original
        </Link>
        <Link className="inline-flex min-h-9 items-center gap-2 border border-black px-3 hover:bg-neutral-100" href={viewerUrl} rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" size={15} />
          Abrir leitor em nova aba
        </Link>
        <button className="inline-flex min-h-9 items-center gap-2 border border-black px-3 text-left hover:bg-neutral-100" onClick={onFullscreen} type="button">
          <Maximize2 aria-hidden="true" size={15} />
          Tela cheia
        </button>
      </div>
    </div>
  );
}
