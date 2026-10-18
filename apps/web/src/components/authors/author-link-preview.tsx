import type { LinkMetadata } from "@/infrastructure/source-acquisition/link-metadata-types";
import { MediaMentionCard } from "@/components/media-mention";
import { ExternalLink } from "./external-link";

interface AuthorLinkPreviewProps {
  href: string;
  metadata: LinkMetadata;
}

export function AuthorLinkPreview({ href, metadata }: AuthorLinkPreviewProps) {
  if (!metadata.hasPreview) return <ExternalLink href={href} />;

  return <MediaMentionCard url={href} type="article" metadata={metadata} />;
}
