import type { PublicReaderApiResponse } from './public-reader-api';

export type ViewerReaderResult =
  | { status: 'available'; reader: PublicReaderApiResponse }
  | { status: 'not-found' }
  | { status: 'unavailable' };
