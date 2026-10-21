export type PdfDisplayMode = 'full' | 'fit';

export type PdfDisplayOptionsProps = {
  onChange: (mode: PdfDisplayMode) => void;
  value: PdfDisplayMode;
};
