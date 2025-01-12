"use client";

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const fullUrl = `https://biblioteca-de-zines.vercel.app/${url}`;
  return (
      <iframe id="pdfviewer" src={`http://docs.google.com/gview?embedded=true&url=${fullUrl}&amp;embedded=true`}  frameBorder="0" width="100%" height="100%"></iframe>
  );
};

export default PDFViewer;
