export type ViewerEventType = 'fallback' | 'page-error' | 'page-load' | 'ready';
export type ViewerEvent = {
  slug: string;
  surface: 'reader' | 'embed';
  type: ViewerEventType;
  metadataBytes?: number;
  durationMs?: number;
};

export function isViewerEvent(value: unknown): value is ViewerEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return typeof event.slug === 'string'
    && (event.surface === 'reader' || event.surface === 'embed')
    && (event.type === 'fallback' || event.type === 'page-error' || event.type === 'page-load' || event.type === 'ready')
    && (!('metadataBytes' in event) || (typeof event.metadataBytes === 'number' && Number.isFinite(event.metadataBytes) && event.metadataBytes >= 0))
    && (!('durationMs' in event) || (typeof event.durationMs === 'number' && Number.isFinite(event.durationMs) && event.durationMs >= 0));
}
