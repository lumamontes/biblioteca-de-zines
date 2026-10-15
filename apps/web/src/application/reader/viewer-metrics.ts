import type { ViewerRequestMetric } from './viewer-metrics-types';

export function createViewerRequestMetric(status: string, slug: string, surface: 'reader' | 'embed', origin: string | null): ViewerRequestMetric {
  return { event: 'public_reader_request', origin, slug, status, surface };
}
