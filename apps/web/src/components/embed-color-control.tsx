'use client';

import type { EmbedColorControlProps } from './embed-customizer-types';

export function EmbedColorControl({ label, value, onChange }: EmbedColorControlProps) {
  return (
    <label className="grid gap-1 font-semibold">
      {label}
      <input aria-label={`Cor de ${label.toLowerCase()} do viewer`} className="h-9 w-full cursor-pointer border border-black bg-transparent p-1" onChange={(event) => onChange(event.target.value)} type="color" value={value} />
    </label>
  );
}
