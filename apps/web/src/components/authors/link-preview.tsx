import { MediaMention } from "@/components/media-mention";

interface LinkPreviewProps {
  href: string;
}

export async function LinkPreview({ href }: LinkPreviewProps) {
  return <MediaMention url={href} type="article" />;
}
