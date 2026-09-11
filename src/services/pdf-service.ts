/**
 * PDF Service
 * Extracts pages from PDF files and converts them to image buffers
 * Uses pdfjs-dist with canvas for server-side PDF processing
 */

import sharp from 'sharp';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createCanvas } = require('canvas');

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

type PdfJsLibrary = {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: {
    data: Uint8Array;
    useSystemFonts: boolean;
    verbosity: number;
  }) => { promise: Promise<PdfDocument> };
};

// Import pdfjs-dist - using require to avoid ESM issues in Next.js
let pdfjsLib: PdfJsLibrary;
try {
  // Try legacy build first (better for Node.js)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
} catch {
  // Fallback to regular build
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pdfjsLib = require('pdfjs-dist');
}

// Polyfill browser APIs for Node.js
if (typeof window === 'undefined') {
  // Polyfill DOMMatrix and DOMPoint
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DOMMatrix, DOMPoint } = require('@thednp/dommatrix');
  global.DOMMatrix = DOMMatrix;
  global.DOMPoint = DOMPoint;

  // Configure pdfjs worker for server-side
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extract all pages from a PDF and convert them to image buffers
 * Returns an array of image buffers (one per page)
 */
export async function extractPagesFromPdf(pdfBuffer: Buffer): Promise<Buffer[]> {
  try {
    // Convert Buffer to Uint8Array as required by pdfjs-dist
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      verbosity: 0, // Suppress warnings
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageBuffers: Buffer[] = [];

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

      pageBuffers.push(imageBuffer);
    }

    return pageBuffers;
  } catch (error) {
    throw new Error(
      `Failed to extract pages from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
