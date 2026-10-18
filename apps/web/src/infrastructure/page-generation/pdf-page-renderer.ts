import sharp from 'sharp';
import type { PageRenderer } from '@/application/page-generation/page-generation-types';
import { forEachPageFromPdf } from '@/infrastructure/rendering/pdf-service';

export const renderPdfPages: PageRenderer = async (source, onPage) => forEachPageFromPdf(source.buffer, async (data, pageNumber) => {
  const metadata = await sharp(data).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Rendered PDF page ${pageNumber} has no dimensions`);
  await onPage({ contentType: 'image/png', data, height: metadata.height, pageNumber, width: metadata.width });
});
