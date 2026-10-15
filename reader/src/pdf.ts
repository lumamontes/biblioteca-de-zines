import type { ReaderDocument, ReaderLoader, ReaderPage } from './contract';

export type PdfViewport = { width: number; height: number };

export type PdfPage<Viewport extends PdfViewport = PdfViewport> = {
  getViewport(options: { scale: number }): Viewport;
  render(options: {
    canvas: HTMLCanvasElement | null;
    canvasContext: CanvasRenderingContext2D;
    viewport: Viewport;
  }): {
    promise: Promise<void>;
  };
  cleanup?: () => void;
};

export type PdfDocument<Viewport extends PdfViewport = PdfViewport> = {
  numPages: number;
  getPage(page: number): Promise<PdfPage<Viewport>>;
  cleanup?: () => void;
};

export type PdfJs<Viewport extends PdfViewport = PdfViewport> = {
  getDocument(source: { url: string; disableAutoFetch?: boolean }): {
    promise: Promise<PdfDocument<Viewport>>;
  };
};

export type PdfLoaderOptions<Viewport extends PdfViewport = PdfViewport> = {
  scale?: number;
  renderPage?: (page: PdfPage<Viewport>, index: number) => Promise<ReaderPage>;
};

async function renderCanvasPage<Viewport extends PdfViewport>(
  page: PdfPage<Viewport>,
  index: number,
  scale: number,
): Promise<ReaderPage> {
  if (typeof document === 'undefined') {
    throw new Error('PDF pages require a browser document to render.');
  }
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  try {
    await page.render({ canvas: null, canvasContext: canvas.getContext('2d')!, viewport }).promise;
    return {
      url: canvas.toDataURL('image/png'),
      alt: `PDF page ${index + 1}`,
      index,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    page.cleanup?.();
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** Creates a lazy PDF.js source adapter; only requested pages are fetched and rendered. */
export function createPdfLoader<Viewport extends PdfViewport>(
  pdfjs: PdfJs<Viewport>,
  options: PdfLoaderOptions<Viewport> = {},
): ReaderLoader {
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
      cleanup: () => pdf.cleanup?.(),
    } satisfies ReaderDocument;
  };
}
