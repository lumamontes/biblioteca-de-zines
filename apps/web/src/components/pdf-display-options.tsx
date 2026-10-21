'use client';

import { Scan } from 'lucide-react';
import type { PdfDisplayOptionsProps } from './pdf-display-options-types';

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
