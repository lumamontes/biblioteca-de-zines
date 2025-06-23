import { forwardRef, type ReactNode } from 'react';

export interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, htmlFor, className }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`block text-sm font-medium text-neutral-700 ${className}`}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
