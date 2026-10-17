import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  type LucideIcon,
  Mail,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import type { SocialPlatform } from "./author-link-types";

interface SocialMediaLinkProps {
  href: string;
  platform: SocialPlatform;
}

const SOCIAL_MEDIA: Record<SocialPlatform, { label: string; Icon: LucideIcon }> = {
  facebook: { label: "Ver Facebook", Icon: Facebook },
  github: { label: "Ver GitHub", Icon: Github },
  instagram: { label: "Ver Instagram", Icon: Instagram },
  linkedin: { label: "Ver LinkedIn", Icon: Linkedin },
  substack: { label: "Ver Substack", Icon: Mail },
  youtube: { label: "Ver YouTube", Icon: Youtube },
};

export function SocialMediaLink({ href, platform }: SocialMediaLinkProps) {
  const { label, Icon } = SOCIAL_MEDIA[platform];

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
