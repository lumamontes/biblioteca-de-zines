export type ViewerRequestMetric = {
  event: 'public_reader_request';
  origin: string | null;
  slug: string;
  status: string;
  surface: 'reader' | 'embed';
};
