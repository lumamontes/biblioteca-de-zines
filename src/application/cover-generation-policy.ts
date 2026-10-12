import { isGeneratedCover } from '@/utils/cover-image';
import type { CoverGenerationRecord } from '@/application/cover-generation-types';

export function isCompleteGeneratedCover(
  record: CoverGenerationRecord,
  zineId: number,
  pdfUrl: string,
): boolean {
  return isGeneratedCover(record.cover_image, zineId)
    && record.import_status === 'completed'
    && record.processed_pdf_url === pdfUrl;
}
