'use client';

import { useTransition } from 'react';

type ProgressiveFormProps = {
  /** Route handler used when JavaScript is unavailable. */
  fallbackAction: string;
  /** Server action used with JavaScript; the page updates in place and focus stays put. */
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: React.ReactNode;
};

export function ProgressiveForm({ fallbackAction, action, className, children }: ProgressiveFormProps) {
  const [, startTransition] = useTransition();
  return (
    <form
      action={fallbackAction}
      method="post"
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const formData = new FormData(event.currentTarget, submitter);
        startTransition(() => action(formData));
      }}
    >
      {children}
    </form>
  );
}
