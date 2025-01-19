import PDFViewer from "@/components/pdf-viewer";
import { getZineByUuid } from "@/services/zine-service";
import { getPreviewUrl } from "@/utils/assets";

export default async function ZinePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const preview = await getZineByUuid(id)

  if (!preview) {
    return (
      <h3 
        role="heading"
        className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
        Zine não encontrada!
      </h3>
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
