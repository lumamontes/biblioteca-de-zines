import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  type LucideIcon,
  Mail,
  Youtube,
} from "lucide-react";
import Link from "next/link";

interface AuthorLinksProps {
  value: string | null;
}

interface LinkTreatment {
  label: string;
  Icon: LucideIcon;
}

function splitAuthorLinks(value: string) {
  return value
    .split(/,\s+(?=https?:\/\/)/i)
    .map((link) => link.trim())
    .filter(Boolean);
}

function getLinkTreatment(link: string): LinkTreatment {
  try {
    const hostname = new URL(link).hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "instagram.com") return { label: "Ver Instagram", Icon: Instagram };
    if (hostname === "github.com") return { label: "Ver GitHub", Icon: Github };
    if (hostname === "youtube.com" || hostname === "youtu.be") {
      return { label: "Ver YouTube", Icon: Youtube };
    }
    if (hostname === "linkedin.com") return { label: "Ver LinkedIn", Icon: Linkedin };
    if (hostname === "facebook.com") return { label: "Ver Facebook", Icon: Facebook };
    if (hostname === "substack.com" || hostname.endsWith(".substack.com")) {
      return { label: "Ver Substack", Icon: Mail };
    }

    return { label: `Visitar ${hostname}`, Icon: Globe };
  } catch {
    return { label: "Abrir link", Icon: Globe };
  }
}

export function AuthorLinks({ value }: AuthorLinksProps) {
  if (!value) return null;

  const links = splitAuthorLinks(value);
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3" aria-label="Links relevantes do autor">
      {links.map((link) => {
        const { label, Icon } = getLinkTreatment(link);

        return (
          <Link
            key={link}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
