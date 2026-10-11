import type { ReaderDocument, ReaderLoader, ReaderPage } from './contract';

export type PdfViewport = { width: number; height: number };

export type PdfPage = {
  getViewport(options: { scale: number }): PdfViewport;
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }): {
    promise: Promise<void>;
  };
  cleanup?: () => void;
};

export type PdfDocument = {
  numPages: number;
  getPage(page: number): Promise<PdfPage>;
  cleanup?: () => void;
};

export type PdfJs = {
  getDocument(source: { url: string; disableAutoFetch?: boolean }): {
    promise: Promise<PdfDocument>;
  };
};

export type PdfLoaderOptions = {
  scale?: number;
  renderPage?: (page: PdfPage, index: number) => Promise<ReaderPage>;
};

async function renderCanvasPage(page: PdfPage, index: number, scale: number): Promise<ReaderPage> {
  if (typeof document === 'undefined') {
    throw new Error('PDF pages require a browser document to render.');
  }
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
  const url = canvas.toDataURL('image/png');
  page.cleanup?.();
  return { url, alt: `PDF page ${index + 1}`, index };
}

/** Creates a lazy PDF.js source adapter; only requested pages are fetched and rendered. */
export function createPdfLoader(pdfjs: PdfJs, options: PdfLoaderOptions = {}): ReaderLoader {
  const scale = options.scale ?? 1;
  return async (publication) => {
    if (publication.kind !== 'pdf') {
      throw new Error('The direct-pdf provider requires a PDF publication.');
    }
    const pdf = await pdfjs.getDocument({ url: publication.url, disableAutoFetch: true }).promise;
    return {
      pageCount: pdf.numPages,
      loadPage: async (index) => {
        if (index < 0 || index >= pdf.numPages) throw new Error(`PDF page ${index + 1} is out of range.`);
        const page = await pdf.getPage(index + 1);
        return options.renderPage
          ? options.renderPage(page, index)
          : renderCanvasPage(page, index, scale);
      },
    } satisfies ReaderDocument;
  };
}
