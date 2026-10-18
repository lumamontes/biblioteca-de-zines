export const VIEWER_ALLOWED_HEADERS = 'Content-Type, X-Reader-Beta-Token';

export function createViewerPreflightHeaders(origin: string | null, viewerOrigin: string): Headers {
  const headers = new Headers({
    'Access-Control-Allow-Headers': VIEWER_ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  });
  if (origin === viewerOrigin) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}
