import { createPublicViewerEmbedUrl, createPublicViewerUrl } from './viewer-link';
import { hasUnavailableReaderSource } from './viewer-reader.helpers';
import type { ViewerReaderResult } from './viewer-reader-types';
import type { AvailableZineReadingSurface, ZineReadingSurface } from './reading-surface.types';

export function hasBetaReadingSurface(surface: ZineReadingSurface): surface is AvailableZineReadingSurface {
  return surface.beta !== null;
}

export function createZineReadingSurface(input: {
  pdfUrl: string;
  title: string;
  viewerOrigin?: string;
  reader: ViewerReaderResult;
}): ZineReadingSurface {
  const sourceUnavailable = !input.pdfUrl && hasUnavailableReaderSource(input.reader);
  const beta = input.reader.status === 'available' && input.reader.reader.status === 'ready'
      ? {
          embedUrl: createPublicViewerEmbedUrl(input.viewerOrigin, input.reader.reader.publication.slug),
          viewerUrl: createPublicViewerUrl(input.viewerOrigin, input.reader.reader.publication.slug),
          pageCount: input.reader.reader.manifest.pageCount,
      }
    : null;

  return { availability: sourceUnavailable ? 'unavailable' : 'available', beta, pdfUrl: input.pdfUrl, title: input.title };
}
