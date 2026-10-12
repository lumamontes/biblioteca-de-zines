import { isGeneratedCover } from '@/utils/cover-image';

export type CoverGenerationRecord = {
  cover_image: string | null;
  import_status: string | null;
  processed_pdf_url: string | null;
};

export function isCompleteGeneratedCover(
  record: CoverGenerationRecord,
  zineId: number,
  pdfUrl: string,
): boolean {
  return isGeneratedCover(record.cover_image, zineId)
    && record.import_status === 'completed'
    && record.processed_pdf_url === pdfUrl;
}
