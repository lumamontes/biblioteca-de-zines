import type { PublicReaderResponse } from '@biblioteca-de-zines/reader';

export type ViewerReaderResult =
  | { status: 'available'; reader: PublicReaderResponse }
  | { status: 'not-found' }
  | { status: 'unavailable' };
