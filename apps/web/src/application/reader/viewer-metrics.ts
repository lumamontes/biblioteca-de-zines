import type { ViewerRequestMetric } from './viewer-metrics-types';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';

export function createViewerRequestMetric(status: string, slug: string, surface: ReaderDeliveryMode, origin: string | null): ViewerRequestMetric {
  return { event: 'public_reader_request', origin, slug, status, surface };
}
