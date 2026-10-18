'use client';

import PDFViewer from '@/components/pdf-viewer';
import { BookOpen, Code2, Copy, FileText } from 'lucide-react';
import { useState } from 'react';

type ZineReaderOptionsProps = {
  embedUrl: string;
  pageCount: number;
  pdfUrl: string;
  title: string;
};

export function ZineReaderOptions({ embedUrl, pageCount, pdfUrl, title }: ZineReaderOptionsProps) {
  const [mode, setMode] = useState<'pdf' | 'beta'>('pdf');
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="${embedUrl}" title="Leitor de ${title}" width="100%" height="720" loading="lazy" allow="fullscreen"></iframe>`;

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="w-full max-w-xl">
      <div className="flex gap-1" role="tablist" aria-label="Escolha o leitor">
        <button aria-label="Ler PDF original" aria-selected={mode === 'pdf'} className={mode === 'pdf' ? 'inline-flex items-center justify-center p-1' : 'inline-flex items-center justify-center p-1 opacity-40 hover:opacity-70'} onClick={() => setMode('pdf')} role="tab" title="PDF original" type="button">
          <FileText aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
        <button aria-label={`Ler no leitor beta, ${pageCount} páginas`} aria-selected={mode === 'beta'} className={mode === 'beta' ? 'inline-flex items-center justify-center p-1' : 'inline-flex items-center justify-center p-1 opacity-40 hover:opacity-70'} onClick={() => setMode('beta')} role="tab" title={`Leitor beta, ${pageCount} páginas`} type="button">
          <BookOpen aria-hidden="true" size={18} strokeWidth={1.8} />
          <span className="ml-1 align-top text-[9px] font-semibold uppercase tracking-[0.08em]">beta</span>
        </button>
      </div>

      <div className="mt-3 h-screen overflow-hidden" role="tabpanel">
        {mode === 'pdf' ? <PDFViewer url={pdfUrl} /> : <iframe className="h-full w-full" src={embedUrl} title={`Leitor beta de ${title}`} allow="fullscreen" />}
      </div>

      <details className="mt-4 pt-3">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs font-semibold [&::-webkit-details-marker]:hidden">
          <Code2 aria-hidden="true" size={15} strokeWidth={1.8} />
          Incorporar
        </summary>
        <div className="mt-3 flex max-w-2xl gap-2">
          <input aria-label="Código para incorporar o leitor" className="min-w-0 flex-1 border border-black px-2 py-2 font-mono text-xs" readOnly value={embedCode} />
          <button aria-label={copied ? 'Código copiado' : 'Copiar código para incorporar'} className="shrink-0 p-2 opacity-60 hover:opacity-100" onClick={copyEmbedCode} title={copied ? 'Copiado' : 'Copiar código'} type="button">
            {copied ? <span className="text-xs font-semibold">OK</span> : <Copy aria-hidden="true" size={17} strokeWidth={1.8} />}
          </button>
        </div>
      </details>
    </section>
  );
}
