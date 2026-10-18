import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';

export type ViewerRequestMetric = {
  event: 'public_reader_request';
  origin: string | null;
  slug: string;
  status: string;
  surface: ReaderDeliveryMode;
};
