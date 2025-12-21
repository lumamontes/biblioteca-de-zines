import { Zine } from "@/@types/zine";
import { joinAuthors, limitText } from "./utils";
import { siteConfig } from "@/app/config/site";

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
      url: `https://biblioteca-de-zines.com.br/zine/${slug}`,
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

export function getAuthorMetadata(
  authorName: string,
  authorBio: string | null,
  authorSlug: string,
  firstZine: Zine | null,
  thumbnailUrl: string | null
) {
  const description = authorBio || `Conheça os zines de ${authorName} na Biblioteca de Zines`;
  // Use first zine's cover image if available, otherwise fall back to default OG image
  const ogImage = (thumbnailUrl && !thumbnailUrl.startsWith('file://')) 
    ? thumbnailUrl 
    : siteConfig.ogImage;
  
  return {
    title: `${authorName} - Biblioteca de Zines`,
    description,
    openGraph: {
      title: `${authorName} - Biblioteca de Zines`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: firstZine 
            ? `Capa de "${firstZine.title}" por ${authorName}`
            : `${authorName} - Biblioteca de Zines`,
        },
      ],
      url: `${siteConfig.url}/authors/${authorSlug}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${authorName} - Biblioteca de Zines`,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}