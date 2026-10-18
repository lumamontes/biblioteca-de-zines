import { collectReaderPerformanceMetrics } from './reader-performance';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';

type ReaderEventType = 'fallback' | 'page-error' | 'page-load' | 'ready';

export function createReaderTelemetry(origin: string, slug: string, surface: ReaderDeliveryMode) {
  const startedAt = performance.now();
  const report = (type: ReaderEventType, extras: Record<string, number | string> = {}) => {
    void fetch(`${origin.replace(/\/$/, '')}/api/public-reader/events`, {
      body: JSON.stringify({
        durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
        slug,
        surface,
        type,
        ...extras,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    }).catch(() => undefined);
  };

  return {
    report,
    ready: () => report('ready', collectReaderPerformanceMetrics(origin)),
  };
}
