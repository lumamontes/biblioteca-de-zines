"use client"
import PDFViewer from "@/components/pdf-viewer";
import { getZinePreview } from "@/data/zines";
import { useParams } from "next/navigation";

export default function ZinePreview() {
  const { id } = useParams();

  const preview = getZinePreview(id as string);

  if (!preview) {
    return (
      <p className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
        Zine não encontrada! :(
      </p>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center w-full mx-auto p-4 md:p-0 gap-16">
      <p className="text-sm">{preview.title} por {preview.author.name}</p>
      <div className="bg-neutral-500 w-full h-screen">
        <PDFViewer url={preview.url} />
      </div>
    </div>
  );
}
