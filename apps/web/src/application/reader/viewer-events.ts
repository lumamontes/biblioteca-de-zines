import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';

export const MAX_VIEWER_EVENT_BYTES = 4096;

export type ViewerEventType = 'fallback' | 'page-error' | 'page-load' | 'ready';
type ViewerEventSurface = ReaderDeliveryMode | 'reader';
export type ViewerEvent = {
  slug: string;
  surface: ViewerEventSurface;
  type: ViewerEventType;
  metadataBytes?: number;
  durationMs?: number;
  requestCount?: number;
  cacheBehavior?: 'hit' | 'miss' | 'unknown';
  bundleBytes?: number;
  derivativeBandwidthBytes?: number;
  memoryBytes?: number;
};

export function isViewerEvent(value: unknown): value is ViewerEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return typeof event.slug === 'string' && event.slug.length > 0 && event.slug.length <= 200
    && (event.surface === 'standalone' || event.surface === 'embed' || event.surface === 'reader')
    && (event.type === 'fallback' || event.type === 'page-error' || event.type === 'page-load' || event.type === 'ready')
    && (!('metadataBytes' in event) || (isBoundedMetric(event.metadataBytes, 100_000_000)))
    && (!('durationMs' in event) || (isBoundedMetric(event.durationMs, 86_400_000)))
    && (!('requestCount' in event) || isBoundedMetric(event.requestCount, 100_000))
    && (!('bundleBytes' in event) || isBoundedMetric(event.bundleBytes, 1_000_000_000))
    && (!('derivativeBandwidthBytes' in event) || isBoundedMetric(event.derivativeBandwidthBytes, 10_000_000_000))
    && (!('memoryBytes' in event) || isBoundedMetric(event.memoryBytes, 10_000_000_000))
    && (!('cacheBehavior' in event) || event.cacheBehavior === 'hit' || event.cacheBehavior === 'miss' || event.cacheBehavior === 'unknown');
}

function isBoundedMetric(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
}
