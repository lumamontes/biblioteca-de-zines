import { memo } from 'react';

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const FilterButton = memo<FilterButtonProps>(({ 
  isActive, 
  onClick, 
  children,
  'aria-label': ariaLabel 
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`px-6 py-2.5 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-neutral-800 text-white shadow-md hover:opacity-90 "
        : "bg-white text-neutral-bg-neutral-800 border border-neutral-bg-neutral-800"
    }`}
  >
    {children}
  </button>
));

FilterButton.displayName = 'FilterButton';
