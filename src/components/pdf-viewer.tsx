"use client";

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  return (
    <embed
      style={{
        width: "100%",
        height: "100%",
      }}
      type="application/pdf"
      src={url}
    />
  );
};

export default PDFViewer;
