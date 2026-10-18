import { Globe } from "lucide-react";
import Link from "next/link";

interface ExternalLinkProps {
  href: string;
}

export function ExternalLink({ href }: ExternalLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-2 border border-black px-4 py-2 text-left text-sm font-medium whitespace-normal transition-colors hover:bg-neutral-100"
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      Visitar site do autor
    </Link>
  );
}
