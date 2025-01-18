import PDFViewer from "@/components/pdf-viewer";
import { getZineByUuid } from "@/services/zine-service";
import { getPreviewUrl } from "@/utils/assets";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  const preview = await getZineByUuid(id);

  if (!preview) {
    return {
      title: "Zine não encontrada!",
      description: "A zine que você está procurando não foi encontrada.",
    };
  }

  return {
    title: `${preview.title} por ${preview.author_name}`,
    description: preview.description,
    openGraph: {
      title: preview.title,
      description: preview.description,
      images: [
        {
          url: preview.cover_image,
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
      images: [preview.cover_image],
    },
  };
}

export default async function ZinePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const preview = await getZineByUuid(id)

  if (!preview) {
    return (
      <p className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
        Zine não encontrada! :(
      </p>
    );
  }

  const previewUrl = getPreviewUrl(preview.pdf_url);

  return (
    <div className="flex min-h-screen flex-col items-center w-full mx-auto p-4 md:p-0 gap-16">
      <p className="text-sm">
        <strong>{preview.title}</strong> por {preview.author_name}
      </p>
      <p className="text-sm max-w-xl text-center">
        {preview.description}
      </p>
      <div className="bg-neutral-500 w-full h-screen max-w-xl mx-auto overflow-hidden">
        <PDFViewer url={previewUrl} />
      </div>
    </div>
  );
}
