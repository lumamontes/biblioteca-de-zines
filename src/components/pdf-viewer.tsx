"use client";

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  return (
      <iframe id="pdfviewer" src={url}  frameBorder="0" width="100%" height="100%"></iframe>
  );
};

export default PDFViewer;
