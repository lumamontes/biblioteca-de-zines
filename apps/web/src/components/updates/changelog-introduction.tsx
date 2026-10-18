import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
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

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={`${link[2]}-${index}`}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:bg-blue-50 hover:text-blue-900"
        >
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

export function ChangelogIntroduction({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null;

  return (
    <div className="mb-10 border-l-4 border-neutral-900 bg-neutral-50 p-5 text-neutral-700">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="mb-3 last:mb-0 leading-relaxed">
          {renderInline(paragraph)}
        </p>
      ))}
    </div>
  );
}
