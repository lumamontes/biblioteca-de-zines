import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import { extractFileIdFromUrl, downloadFile } from './google-drive-service';
import type { SourceDocument } from '@/domain/source-document';

export async function downloadSource(url: string): Promise<SourceDocument> {
  if (url.includes('drive.google.com')) {
    return downloadFile(extractFileIdFromUrl(url));
  }

  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download source file: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || detectFileTypeFromBuffer(buffer).mimeType;
  return { buffer, mimeType };
}
