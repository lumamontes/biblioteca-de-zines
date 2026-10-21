'use client';

import type { ReaderModeTabProps } from './zine-reader-options.types';

export function ReaderModeTab({ active, ariaLabel, icon, label, onClick }: ReaderModeTabProps) {
  const className = active
    ? 'inline-flex w-full items-center justify-start gap-2 border border-black bg-black px-3 py-2.5 text-left text-xs font-semibold text-white'
    : 'inline-flex w-full items-center justify-start gap-2 border border-black px-3 py-2.5 text-left text-xs font-semibold text-black opacity-60 hover:opacity-100';

  return <button aria-label={ariaLabel ?? label} aria-selected={active} className={className} onClick={onClick} role="tab" type="button">{icon}{label}</button>;
}
