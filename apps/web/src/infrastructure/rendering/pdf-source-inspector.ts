import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PdfInspection } from '@/domain/source-observation-types';

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
};

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  getMetadata: () => Promise<{ info?: Record<string, unknown> }>;
};

type PdfJsLibrary = {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array; verbosity: number }) => { promise: Promise<PdfDocument> };
};

let libraryPromise: Promise<PdfJsLibrary> | undefined;

async function pdfJs(): Promise<PdfJsLibrary> {
  libraryPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs').then((module) => {
    const library = module as unknown as PdfJsLibrary;
    const nodeRequire = createRequire(import.meta.url);
    const directory = dirname(nodeRequire.resolve('pdfjs-dist/package.json'));
    library.GlobalWorkerOptions.workerSrc = pathToFileURL(join(directory, 'legacy', 'build', 'pdf.worker.mjs')).href;
    return library;
  });
  return libraryPromise;
}

export async function inspectPdfSource(buffer: Buffer): Promise<PdfInspection> {
  const document = await (await pdfJs()).getDocument({ data: new Uint8Array(buffer), verbosity: 0 }).promise;
  const metadata = (await document.getMetadata()).info ?? {};
  const pages: PdfInspection['pages'] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    try {
      const text = await page.getTextContent();
      pages.push({ width: viewport.width, height: viewport.height, text: { status: text.items.some((item) => item.str?.trim()) ? 'present' : 'absent', extracted: true } });
    } catch {
      pages.push({ width: viewport.width, height: viewport.height, text: { status: 'unknown', extracted: false } });
    }
  }
  return {
    tool: `pdfjs-dist ${ (await pdfJs()).version }`,
    metadata: {
      title: stringValue(metadata.Title), author: stringValue(metadata.Author), subject: stringValue(metadata.Subject),
      creator: stringValue(metadata.Creator), producer: stringValue(metadata.Producer),
      creationDate: stringValue(metadata.CreationDate), modificationDate: stringValue(metadata.ModDate),
    },
    pages,
  };
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
