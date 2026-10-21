'use client';

import { Code2, Copy, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { EmbedCustomizerProps } from './embed-customizer-types';

export function EmbedCustomizer({ copyStatus, embedCode, onCopy, previewUrl, title, triggerClassName = '' }: EmbedCustomizerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <>
      <button className={`inline-flex h-9 items-center gap-2 border border-black px-3 hover:bg-neutral-100 ${triggerClassName}`} onClick={() => setOpen(true)} type="button">
        <Code2 aria-hidden="true" size={15} strokeWidth={1.8} />
        Incorporar
      </button>
      {open && createPortal(
        <div className="embed-modal-overlay fixed inset-0 z-50 grid w-screen place-items-center overflow-y-auto bg-black/40 p-4" role="presentation">
          <div aria-labelledby="embed-customizer-title" aria-modal="true" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto border border-black bg-white p-4 shadow-2xl" role="dialog">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-neutral-200 pb-3">
              <div>
                <h2 className="text-base font-semibold" id="embed-customizer-title">Incorporar leitura digital</h2>
                <p className="mt-1 text-xs text-neutral-500">Copie o código para incorporar esta leitura digital.</p>
              </div>
              <button aria-label="Fechar configuração de incorporação" className="flex size-9 shrink-0 items-center justify-center border border-black hover:bg-neutral-100" onClick={() => setOpen(false)} type="button">
                <X aria-hidden="true" size={17} />
              </button>
            </div>
            <div className="mt-1 flex max-w-2xl gap-2">
              <input aria-label="Código para incorporar o leitor" className="min-w-0 flex-1 border border-black px-2 py-2 font-mono text-xs" readOnly value={embedCode} />
              <button aria-label="Copiar código para incorporar" className="flex size-9 shrink-0 items-center justify-center border border-black opacity-60 hover:opacity-100" onClick={onCopy} title={copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'Não foi possível copiar automaticamente' : 'Copiar código'} type="button">
                <Copy aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold">Prévia da incorporação</p>
              <div className="h-64 overflow-hidden border border-neutral-200 bg-neutral-100 sm:h-80">
                <iframe allow="fullscreen" className="h-full w-full border-0" src={previewUrl} title={`Prévia incorporada de ${title}`} />
              </div>
            </div>
            <span aria-live="polite" className="sr-only">{copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'Não foi possível copiar automaticamente. Selecione e copie o código manualmente.' : ''}</span>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
