import type { ProcessingRequester } from '@/application/processing/processing-request-types';

export interface ZineSourceRepository {
  updatePdfUrl(zineId: number, pdfUrl: string): Promise<void>;
}

export type { ProcessingRequester as ZineProcessingRequester };
