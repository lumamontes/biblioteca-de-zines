export type ViewerEventType = 'fallback' | 'page-error' | 'ready';

export type ViewerEvent = {
  slug: string;
  surface: 'reader' | 'embed';
  type: ViewerEventType;
};

export function isViewerEvent(value: unknown): value is ViewerEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return typeof event.slug === 'string'
    && (event.surface === 'reader' || event.surface === 'embed')
    && (event.type === 'fallback' || event.type === 'page-error' || event.type === 'ready');
}
