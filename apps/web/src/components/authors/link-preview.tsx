import { Globe } from "lucide-react";
import Link from "next/link";

interface LinkPreviewProps {
  href: string;
  hostname: string;
}

export function LinkPreview({ href, hostname }: LinkPreviewProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100"
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      Visitar {hostname}
    </Link>
  );
}
