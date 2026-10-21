import type { PublicReaderResponse } from '@biblioteca-de-zines/reader';

export type ViewerReaderResult =
  | { status: 'available'; reader: PublicReaderResponse }
  | { status: 'not-found' }
  | { status: 'unavailable' };

export function hasUnavailableReaderSource(result: ViewerReaderResult): boolean {
  if (result.status === 'unavailable') return true;
  return result.status === 'available'
    && result.reader.status === 'fallback'
    && result.reader.reason === 'source-unavailable';
}
