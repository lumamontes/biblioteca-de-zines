export const IMMUTABLE_DERIVATIVE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
export const REVALIDATABLE_READER_METADATA_CACHE_CONTROL = 'private, max-age=0, must-revalidate';

export function createReaderResponseHeaders(
  origin: string | null,
  viewerOrigin: string,
  remaining = 120,
): Headers {
  const headers = new Headers({
    'Cache-Control': REVALIDATABLE_READER_METADATA_CACHE_CONTROL,
    'X-RateLimit-Remaining': String(remaining),
    Vary: 'Origin',
  });
  if (origin === viewerOrigin) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}
