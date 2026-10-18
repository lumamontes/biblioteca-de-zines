import type { ViewerReaderResult } from '@/application/reader/viewer-reader-types';

export function createViewerReaderHttpResponse(result: ViewerReaderResult) {
  if (result.status === 'available') return { body: result.reader, status: 200 } as const;
  if (result.status === 'not-found') return { body: { error: 'Publication not found' }, status: 404 } as const;
  return { body: { error: 'Reader unavailable' }, status: 404 } as const;
}
