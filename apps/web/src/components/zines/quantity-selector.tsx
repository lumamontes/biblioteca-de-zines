"use client";

import { memo } from 'react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const QUANTITY_OPTIONS = [20, 50, 100] as const;

export const QuantitySelector = memo<QuantitySelectorProps>(({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="quantity-selector" className="text-sm font-medium">
        Itens por página:
      </label>
      <select
        id="quantity-selector"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-1.5 text-sm border border-black rounded-md bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-colors"
        aria-label="Selecionar quantidade de itens por página"
      >
        {QUANTITY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});

QuantitySelector.displayName = 'QuantitySelector';

