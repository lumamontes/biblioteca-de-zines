import Image from "next/image";
import Link from "next/link";
import { readLinkMetadata } from "@/infrastructure/source-acquisition/link-metadata-reader";

interface MediaMentionProps {
  url: string;
  type: "instagram" | "youtube" | "article";
}

function getTypeIcon(type: MediaMentionProps["type"], domain: string) {
  if (domain.includes("instagram")) return "📷";
  if (domain.includes("youtube")) return "📹";
  if (domain.includes("dropsdejogos")) return "🎮";
  if (domain.includes("hqpop")) return "📚";
  if (type === "article") return "🔗";
  return "🔗";
}

const PLACEHOLDER_COVER_IMAGE = "/instagramPlaceholder.jpg";

export async function MediaMention({ url, type }: MediaMentionProps) {
  const metadata = await readLinkMetadata(url);
  const typeIcon = getTypeIcon(type, metadata.domain);

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="group w-full max-w-sm">
      <div className="overflow-hidden rounded-lg border-2 border-neutral-100 bg-white">
        <div className="relative h-32 overflow-hidden">
          {metadata.image || metadata.domain.includes("instagram.com") ? (
            <Image
              src={metadata.domain.includes("instagram.com") ? PLACEHOLDER_COVER_IMAGE : metadata.image}
              alt={metadata.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">{typeIcon}</div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-black group-hover:text-black/80">
            {metadata.title}
          </h3>
          {metadata.description && (
            <p className="mt-1 line-clamp-2 text-xs text-black/70">{metadata.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
