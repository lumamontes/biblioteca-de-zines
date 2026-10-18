import {
  Code2,
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
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { SocialPlatform } from "./author-link-types";

interface SocialMediaLinkProps {
  href: string;
  platform: SocialPlatform;
}

const SOCIAL_MEDIA: Record<SocialPlatform, { label: string; Icon?: LucideIcon; image?: string }> = {
  "apoia-se": { label: "Apoiar no Apoia.se", Icon: Coffee },
  bandcamp: { label: "Ver Bandcamp", Icon: Music },
  bluesky: { label: "Ver Bluesky", image: "/social/bluesky.png" },
  "buy-me-a-coffee": { label: "Apoiar no Buy Me a Coffee", Icon: Coffee },
  catarse: { label: "Apoiar no Catarse", Icon: Coffee },
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
  "open-collective": { label: "Apoiar no Open Collective", Icon: Coffee },
  patreon: { label: "Ver Patreon", Icon: Podcast },
  paypal: { label: "Apoiar pelo PayPal", Icon: Coffee },
  sourcehut: { label: "Ver SourceHut", Icon: GitBranch },
  substack: { label: "Ver Substack", Icon: Mail },
  twitter: { label: "Ver Twitter (X)", image: "/social/twitter.svg" },
  vakinha: { label: "Apoiar na Vakinha", Icon: Coffee },
  youtube: { label: "Ver YouTube", Icon: Youtube },
};

export function SocialMediaLink({ href, platform }: SocialMediaLinkProps) {
  const { label, Icon, image } = SOCIAL_MEDIA[platform];

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-fit max-w-full self-start items-center gap-2 border border-black px-4 py-2 text-left text-sm font-medium whitespace-normal transition-colors hover:bg-neutral-100"
    >
      {image ? (
        <Image src={image} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {label}
    </Link>
  );
}
