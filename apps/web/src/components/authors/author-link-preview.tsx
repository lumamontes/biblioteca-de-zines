import { readLinkMetadata } from "@/infrastructure/source-acquisition/link-metadata-reader";
import { MediaMentionCard } from "@/components/media-mention";
import { ExternalLink } from "./external-link";

interface AuthorLinkPreviewProps {
  href: string;
}

export async function AuthorLinkPreview({ href }: AuthorLinkPreviewProps) {
  const metadata = await readLinkMetadata(href);

  if (!metadata.hasPreview) return <ExternalLink href={href} />;

  return <MediaMentionCard url={href} type="article" metadata={metadata} />;
}
