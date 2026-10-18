'use client';

import { BookOpen, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ReaderDisplayMode } from './zine-reader-options-types';

type ReaderModeTabsProps = {
  pageCount: number;
  value: ReaderDisplayMode;
  onChange: (mode: ReaderDisplayMode) => void;
};

export function ReaderModeTabs({ pageCount, value, onChange }: ReaderModeTabsProps) {
  return (
    <div className="flex justify-start gap-2" role="tablist" aria-label="Escolha o leitor">
      <ModeTab active={value === 'pdf'} icon={<FileText aria-hidden="true" size={18} strokeWidth={1.8} />} label="Pré-visualização em PDF" onClick={() => onChange('pdf')} />
      <ModeTab active={value === 'beta'} icon={<BookOpen aria-hidden="true" size={18} strokeWidth={1.8} />} label="Leitor beta" onClick={() => onChange('beta')} ariaLabel={`Ler no leitor beta, ${pageCount} páginas`} />
    </div>
  );
}

function ModeTab({ active, ariaLabel, icon, label, onClick }: { active: boolean; ariaLabel?: string; icon: ReactNode; label: string; onClick: () => void }) {
  const className = active
    ? 'inline-flex items-center gap-2 border border-black bg-black px-3 py-2 text-xs font-semibold text-white'
    : 'inline-flex items-center gap-2 border border-black px-3 py-2 text-xs font-semibold text-black opacity-60 hover:opacity-100';

  return <button aria-label={ariaLabel ?? label} aria-selected={active} className={className} onClick={onClick} role="tab" type="button">{icon}{label}</button>;
}
