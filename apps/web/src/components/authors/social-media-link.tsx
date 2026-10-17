import {
  Code2,
  Cloud,
  Facebook,
  Gamepad2,
  Github,
  GitBranch,
  Globe,
  Instagram,
  Linkedin,
  type LucideIcon,
  Mail,
  MessageCircle,
  Music,
  Network,
  Podcast,
  Coffee,
  X,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import type { SocialPlatform } from "./author-link-types";

interface SocialMediaLinkProps {
  href: string;
  platform: SocialPlatform;
}

const SOCIAL_MEDIA: Record<SocialPlatform, { label: string; Icon: LucideIcon }> = {
  bandcamp: { label: "Ver Bandcamp", Icon: Music },
  bluesky: { label: "Ver Bluesky", Icon: Cloud },
  codeberg: { label: "Ver Codeberg", Icon: GitBranch },
  devto: { label: "Ver DEV Community", Icon: Code2 },
  facebook: { label: "Ver Facebook", Icon: Facebook },
  github: { label: "Ver GitHub", Icon: Github },
  gitlab: { label: "Ver GitLab", Icon: GitBranch },
  instagram: { label: "Ver Instagram", Icon: Instagram },
  itchio: { label: "Ver itch.io", Icon: Gamepad2 },
  "ko-fi": { label: "Ver Ko-fi", Icon: Coffee },
  linktree: { label: "Ver Linktree", Icon: Network },
  linkedin: { label: "Ver LinkedIn", Icon: Linkedin },
  mastodon: { label: "Ver Mastodon", Icon: MessageCircle },
  medium: { label: "Ver Medium", Icon: Globe },
  patreon: { label: "Ver Patreon", Icon: Podcast },
  sourcehut: { label: "Ver SourceHut", Icon: GitBranch },
  substack: { label: "Ver Substack", Icon: Mail },
  twitter: { label: "Ver X", Icon: X },
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
