import { createPublicViewerEmbedUrl } from './viewer-link';
import type { ViewerReaderResult } from './viewer-reader-types';

export type ZineReadingSurface = {
  pdfUrl: string;
  title: string;
  beta: {
    embedUrl: string;
    pageCount: number;
  } | null;
};
export type AvailableZineReadingSurface = Omit<ZineReadingSurface, 'beta'> & {
  beta: NonNullable<ZineReadingSurface['beta']>;
};

export function hasBetaReadingSurface(surface: ZineReadingSurface): surface is AvailableZineReadingSurface {
  return surface.beta !== null;
}

export function createZineReadingSurface(input: {
  pdfUrl: string;
  title: string;
  viewerOrigin?: string;
  reader: ViewerReaderResult;
}): ZineReadingSurface {
  const beta = input.reader.status === 'available' && input.reader.reader.status === 'ready'
    ? {
        embedUrl: createPublicViewerEmbedUrl(input.viewerOrigin, input.reader.reader.publication.slug),
        pageCount: input.reader.reader.manifest.pageCount,
      }
    : null;

  return { beta, pdfUrl: input.pdfUrl, title: input.title };
}
