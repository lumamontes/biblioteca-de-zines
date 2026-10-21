'use client';

import { BookOpen, FileText, Scan } from 'lucide-react';
import { ReaderModeTab } from './reader-mode-tab';
import type { PdfDisplayOptionsProps, ReaderModeTabsProps } from './zine-reader-options-types';

export function ReaderModeTabs({ pageCount, value, onChange }: ReaderModeTabsProps) {
  return (
    <div className="grid gap-2" role="tablist" aria-label="Escolha o leitor">
      <ReaderModeTab active={value === 'pdf'} icon={<FileText aria-hidden="true" size={18} strokeWidth={1.8} />} label="Visualização de PDF" onClick={() => onChange('pdf')} />
      <ReaderModeTab active={value === 'beta'} icon={<BookOpen aria-hidden="true" size={18} strokeWidth={1.8} />} label="Leitura digital" onClick={() => onChange('beta')} ariaLabel={`Abrir a leitura digital, ${pageCount} páginas`} />
    </div>
  );
}

export function PdfDisplayOptions({ onChange, value }: PdfDisplayOptionsProps) {
  return (
    <div className="grid gap-2 border-t border-neutral-200 pt-5" role="group" aria-label="Formato da visualização">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Exibição da página</p>
      <div className="grid gap-2">
        <button
          aria-pressed={value === 'full'}
          className={`min-h-9 border px-3 py-2 text-left text-xs font-semibold ${value === 'full' ? 'border-black bg-neutral-100' : 'border-neutral-300 text-neutral-600 hover:border-black'}`}
          onClick={() => onChange('full')}
          type="button"
        >
          Ocupar área
        </button>
        <button
          aria-pressed={value === 'fit'}
          className={`inline-flex min-h-9 items-center gap-2 border px-3 py-2 text-left text-xs font-semibold ${value === 'fit' ? 'border-black bg-neutral-100' : 'border-neutral-300 text-neutral-600 hover:border-black'}`}
          onClick={() => onChange('fit')}
          type="button"
        >
          <Scan aria-hidden="true" size={14} />
          Página inteira
        </button>
      </div>
    </div>
  );
}
