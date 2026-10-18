'use client';

import { BookOpen, FileText } from 'lucide-react';
import { ReaderModeTab } from './reader-mode-tab';
import type { ReaderModeTabsProps } from './zine-reader-options-types';

export function ReaderModeTabs({ pageCount, value, onChange }: ReaderModeTabsProps) {
  return (
    <div className="flex justify-start gap-2" role="tablist" aria-label="Escolha o leitor">
      <ReaderModeTab active={value === 'pdf'} icon={<FileText aria-hidden="true" size={18} strokeWidth={1.8} />} label="Pré-visualização em PDF" onClick={() => onChange('pdf')} />
      <ReaderModeTab active={value === 'beta'} icon={<BookOpen aria-hidden="true" size={18} strokeWidth={1.8} />} label="Leitura digital" onClick={() => onChange('beta')} ariaLabel={`Abrir a leitura digital, ${pageCount} páginas`} />
    </div>
  );
}
