import type { ViewerReaderResult } from './viewer-reader-types';

export function hasUnavailableReaderSource(result: ViewerReaderResult): boolean {
  if (result.status === 'unavailable') return true;
  return result.status === 'available'
    && result.reader.status === 'fallback'
    && result.reader.reason === 'source-unavailable';
}
