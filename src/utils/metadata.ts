import { Zine } from "@/@types/zine";
import { joinAuthors, limitText } from "./utils";

export function getSlugZineMetadata(slug: string, preview: Zine, thumbnailUrl: string) {
  return {
    title: `${preview.title} por ${joinAuthors(preview.library_zines_authors)}`,
    description: preview.description
      ? limitText(preview.description)
      : preview.title,
    openGraph: {
      title: preview.title,
      description: preview.description,
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
        },
      ],
      url: `https://biblioteca-de-zines.vercel.app/zine/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: preview.title,
      description: preview.description,
      images: [thumbnailUrl],
    },
  };
}