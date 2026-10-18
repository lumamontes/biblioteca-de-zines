const DEFAULT_VIEWER_ORIGIN = 'https://viewer.biblioteca-de-zines.com.br';

export function createPublicViewerUrl(origin: string | undefined, slug: string): string {
  const viewerOrigin = (origin || DEFAULT_VIEWER_ORIGIN).replace(/\/$/, '');
  return `${viewerOrigin}/viewer/v1/${encodeURIComponent(slug)}`;
}

export function createPublicViewerEmbedUrl(origin: string | undefined, slug: string): string {
  const viewerOrigin = (origin || DEFAULT_VIEWER_ORIGIN).replace(/\/$/, '');
  return `${viewerOrigin}/embed/v1/${encodeURIComponent(slug)}`;
}
