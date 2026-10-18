'use client';

import { Code2, Copy, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { EmbedColorControl } from './embed-color-control';
import { parseReaderBranding } from './embed-customizer-config';
import type { EmbedCustomizerProps } from './embed-customizer-types';

export function EmbedCustomizer({ configuration, copyStatus, embedCode, onCopy, onUpdate, triggerClassName = '' }: EmbedCustomizerProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div aria-labelledby="embed-customizer-title" aria-modal="true" className="w-full max-w-2xl border border-black bg-white p-4 shadow-2xl" role="dialog">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-neutral-200 pb-3">
              <div>
                <h2 className="text-base font-semibold" id="embed-customizer-title">Incorporar leitura digital</h2>
                <p className="mt-1 text-xs text-neutral-500">Personalize a aparência e copie o código para incorporar.</p>
              </div>
              <button aria-label="Fechar configuração de incorporação" className="flex size-9 shrink-0 items-center justify-center border border-black hover:bg-neutral-100" onClick={() => setOpen(false)} type="button">
                <X aria-hidden="true" size={17} />
              </button>
            </div>
            <div className="grid gap-3 text-xs sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <label className="grid gap-1 font-semibold">
                Preset
                <select className="border border-black bg-transparent px-2 py-2 font-normal" onChange={(event) => onUpdate({ branding: parseReaderBranding(event.target.value) })} value={configuration.branding}>
                  <option value="none">Sem branding</option>
                  <option value="biblioteca">Biblioteca de Zines</option>
                </select>
              </label>
              <EmbedColorControl label="Fundo" value={configuration.background} onChange={(background) => onUpdate({ background })} />
              <EmbedColorControl label="Texto" value={configuration.text} onChange={(text) => onUpdate({ text })} />
            </div>
            <div className="mt-4 flex max-w-2xl gap-2">
              <input aria-label="Código para incorporar o leitor" className="min-w-0 flex-1 border border-black px-2 py-2 font-mono text-xs" readOnly value={embedCode} />
              <button aria-label="Copiar código para incorporar" className="flex size-9 shrink-0 items-center justify-center border border-black opacity-60 hover:opacity-100" onClick={onCopy} title={copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'Não foi possível copiar automaticamente' : 'Copiar código'} type="button">
                <Copy aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            </div>
            <span aria-live="polite" className="sr-only">{copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'Não foi possível copiar automaticamente. Selecione e copie o código manualmente.' : ''}</span>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
