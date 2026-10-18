'use client';

import { Code2, Copy } from 'lucide-react';
import type { ReaderBranding, ReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';

type EmbedCustomizerProps = {
  configuration: ReaderEmbedConfiguration;
  copyStatus: 'idle' | 'copied' | 'error';
  embedCode: string;
  onCopy: () => void;
  onUpdate: (next: Partial<ReaderEmbedConfiguration>) => void;
};

export function EmbedCustomizer({ configuration, copyStatus, embedCode, onCopy, onUpdate }: EmbedCustomizerProps) {
  return (
    <details className="mt-2">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-2 border border-black px-3 py-2 text-xs font-semibold [&::-webkit-details-marker]:hidden">
        <Code2 aria-hidden="true" size={15} strokeWidth={1.8} />
        Incorporar
      </summary>
      <div className="mt-3 grid gap-3 border border-black p-3 text-xs sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="grid gap-1 font-semibold">
          Preset
          <select className="border border-black bg-transparent px-2 py-2 font-normal" onChange={(event) => onUpdate({ branding: parseBranding(event.target.value) })} value={configuration.branding}>
            <option value="none">Sem branding</option>
            <option value="biblioteca">Biblioteca de Zines</option>
          </select>
        </label>
        <ColorControl label="Fundo" value={configuration.background} onChange={(background) => onUpdate({ background })} />
        <ColorControl label="Texto" value={configuration.text} onChange={(text) => onUpdate({ text })} />
      </div>
      <div className="mt-3 flex max-w-2xl gap-2">
        <input aria-label="Código para incorporar o leitor" className="min-w-0 flex-1 border border-black px-2 py-2 font-mono text-xs" readOnly value={embedCode} />
        <button aria-label="Copiar código para incorporar" className="flex size-9 shrink-0 items-center justify-center border border-black opacity-60 hover:opacity-100" onClick={onCopy} title={copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'Não foi possível copiar automaticamente' : 'Copiar código'} type="button">
          <Copy aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
      </div>
      <span aria-live="polite" className="sr-only">{copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'Não foi possível copiar automaticamente. Selecione e copie o código manualmente.' : ''}</span>
    </details>
  );
}

function parseBranding(value: string): ReaderBranding {
  return value === 'biblioteca' ? 'biblioteca' : 'none';
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1 font-semibold">{label}<input aria-label={`Cor de ${label.toLowerCase()} do viewer`} className="h-9 w-full cursor-pointer border border-black bg-transparent p-1" onChange={(event) => onChange(event.target.value)} type="color" value={value} /></label>;
}
