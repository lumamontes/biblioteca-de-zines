import type { ReactNode } from "react";

export function renderChangelogSummary(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-900"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}
