/**
 * PDF Service
 * Extracts pages from PDF files and converts them to image buffers
 * Uses pdfjs-dist with canvas for server-side PDF processing
 */

import sharp from 'sharp';
import { createCanvas, DOMMatrix, DOMPoint } from '@napi-rs/canvas';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
};

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (context: {
    canvasContext: unknown;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
};

type RenderCanvas = {
  getContext: (context: '2d') => unknown;
  height: number;
  toBuffer: (mimeType: string) => Buffer;
  width: number;
};

type PdfJsLibrary = {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: {
    CanvasFactory?: typeof ProjectCanvasFactory;
    data: Uint8Array;
    isImageDecoderSupported?: boolean;
    isOffscreenCanvasSupported?: boolean;
    useSystemFonts: boolean;
    verbosity: number;
  }) => { promise: Promise<PdfDocument> };
};

class ProjectCanvasFactory {
  create(width: number, height: number): { canvas: RenderCanvas; context: unknown } {
    const canvas = createCanvas(width, height) as unknown as RenderCanvas;
    return { canvas, context: canvas.getContext('2d') };
  }

  reset(
    canvasAndContext: { canvas: RenderCanvas },
    width: number,
    height: number,
  ): void {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: { canvas: RenderCanvas }): void {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

// Polyfill browser APIs for Node.js
if (typeof window === 'undefined') {
  // Use the same geometry types as the canvas implementation used for rendering.
  global.DOMMatrix = DOMMatrix as unknown as typeof global.DOMMatrix;
  global.DOMPoint = DOMPoint as unknown as typeof global.DOMPoint;

}

let pdfjsLibPromise: Promise<PdfJsLibrary> | undefined;

async function getPdfJsLibrary(): Promise<PdfJsLibrary> {
  pdfjsLibPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs').then((module) => {
    const pdfjsLib = module as unknown as PdfJsLibrary;
    if (typeof window === 'undefined') {
      const nodeRequire = createRequire(import.meta.url);
      const pdfjsPackageDirectory = dirname(nodeRequire.resolve('pdfjs-dist/package.json'));
      pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
        join(pdfjsPackageDirectory, 'legacy', 'build', 'pdf.worker.mjs'),
      ).href;
    }
    return pdfjsLib;
  });
  return pdfjsLibPromise;
}

/**
 * Extract all pages from a PDF and convert them to image buffers
 * Returns an array of image buffers (one per page)
 */
export async function extractPagesFromPdf(
  pdfBuffer: Buffer,
  options: { maxPages?: number } = {},
): Promise<Buffer[]> {
  const pages: Buffer[] = [];
  await forEachPageFromPdf(pdfBuffer, async (pageBuffer) => {
    pages.push(pageBuffer);
  }, options);
  return pages;
}

export async function extractFirstPageFromPdf(pdfBuffer: Buffer): Promise<Buffer> {
  let firstPage: Buffer | undefined;
  await forEachPageFromPdf(pdfBuffer, async (pageBuffer) => {
    firstPage = pageBuffer;
  }, { maxPages: 1 });
  if (!firstPage) throw new Error('The source PDF has no pages');
  return firstPage;
}

export async function forEachPageFromPdf(
  pdfBuffer: Buffer,
  onPage: (pageBuffer: Buffer, pageNumber: number) => Promise<void>,
  options: { maxPages?: number } = {},
): Promise<number> {
  try {
    const pdfjsLib = await getPdfJsLibrary();
    // Convert Buffer to Uint8Array as required by pdfjs-dist
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      CanvasFactory: ProjectCanvasFactory,
      isImageDecoderSupported: false,
      isOffscreenCanvasSupported: false,
      useSystemFonts: true,
      verbosity: 0, // Suppress warnings
    });

    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, options.maxPages ?? pdf.numPages);

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Set scale for rendering (2x for better quality)
      const scale = 2.0;
      const viewport = page.getViewport({ scale });

      // Create canvas for rendering
      const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
      const context = canvas.getContext('2d');

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Convert canvas to PNG buffer
      const pngBuffer = canvas.toBuffer('image/png');

      // Optimize with sharp
      const imageBuffer = await sharp(pngBuffer)
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();

      await onPage(imageBuffer, pageNum);
    }

    return numPages;
  } catch (error) {
    throw new Error(
      `Failed to extract pages from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
