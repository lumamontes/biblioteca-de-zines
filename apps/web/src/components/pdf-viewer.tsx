"use client";

interface PDFViewerProps {
  fitToPage?: boolean;
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fitToPage = false, url }) => {
  return (
    <div className={fitToPage ? 'flex h-full w-full items-center justify-center bg-neutral-100 p-3' : 'h-full w-full'}>
      <iframe
        className={fitToPage ? 'aspect-[0.707] h-full max-h-full w-auto max-w-full border-0' : 'h-full w-full border-0'}
        frameBorder="0"
        id="pdfviewer"
        src={url}
        title="Visualização do PDF"
      />
    </div>
  );
};

export default PDFViewer;
