import PDFViewer from "@/components/pdf-viewer";
import { getZineByUuid } from "@/services/zine-service";
import { getPreviewUrl, getThumbnailUrl } from "@/utils/assets";
import { limitText } from "@/utils/utils";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const preview = await getZineByUuid(id);

  if (!preview) {
    return {
      title: "Zine não encontrada!",
      description: "A zine que você está procurando não foi encontrada.",
    };
  }

  const thumbnailUrl = getThumbnailUrl(preview.cover_image);

  return {
    title: `${preview.title} por ${preview.library_zines_authors.map((a) => a.authors.name).join(", ")}`,
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
      url: `https://biblioteca-de-zines.vercel.app/zine/${id}`,
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

export default async function ZinePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const preview = await getZineByUuid(id);

  if (!preview) {
    return (
      <h3 
        className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
        Zine não encontrada!
      </h3>
    );
  }

  const previewUrl = getPreviewUrl(preview.pdf_url);

  return (
    <div className="flex min-h-screen flex-col items-center w-full mx-auto p-4 md:p-0 gap-16">
      <p className="text-sm">
        <strong>{preview.title}</strong> por {preview.library_zines_authors.map((a) => a.authors.name).join(", ")}
      </p>
      <div className="flex flex-col items-center">
      {preview.library_zines_authors.length > 0 && preview.library_zines_authors.map(({authors}) => (
          <Link
            key={authors.id}
            href={authors.url}
            target="_blank"
            className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-black border border-black rounded-md hover:bg-neutral-100 transition"
          >
            Conhecer autor: {authors.name}
          </Link>
        ))}
      </div>
      <p className="text-sm max-w-xl text-center">{preview.description}</p>
      <div className="bg-neutral-500 w-full h-screen max-w-xl mx-auto overflow-hidden">
        <PDFViewer url={previewUrl} />
      </div>
    </div>
  );
}
