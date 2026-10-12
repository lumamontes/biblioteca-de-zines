export type ViewerSurface = 'embed' | 'viewer';

export function createViewerSecurityHeaders(
  surface: ViewerSurface,
  viewerOrigin = 'https://viewer.biblioteca-de-zines.com.br',
) {
  const frameAncestors = surface === 'embed'
    ? '*'
    : `https://biblioteca-de-zines.com.br ${viewerOrigin}`;

  return [
    { key: 'Content-Security-Policy', value: `frame-ancestors ${frameAncestors}` },
    { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
    { key: 'Permissions-Policy', value: 'fullscreen=(self)' },
    { key: 'Referrer-Policy', value: 'no-referrer' },
  ];
}
