import { extractFileIdFromUrl, downloadFile } from './google-drive-service';
import { SourceAcquisitionError, type SourceDocument } from '@/domain/source-document';
import { detectFileTypeFromBuffer as detectType } from '@/utils/file-type-detection';
import { filenameFromContentDisposition, parseByteSize } from './acquisition-metadata';

export async function downloadSource(url: string): Promise<SourceDocument> {
  if (url.includes('drive.google.com')) {
    return downloadFile(extractFileIdFromUrl(url));
  }

  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new SourceAcquisitionError(`Failed to download source file: ${response.status} ${response.statusText}`, {
      acquiredAt: new Date().toISOString(), filename: filenameFromContentDisposition(response.headers.get('content-disposition')),
      declaredSize: parseByteSize(response.headers.get('content-length')), httpStatus: response.status,
      receivedByteSize: null,
      redirectOutcome: response.redirected ? 'redirected' : 'not_redirected', declaredMediaType: response.headers.get('content-type'), detectedMediaType: 'application/octet-stream',
    });
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const declaredMediaType = response.headers.get('content-type');
  const detectedMediaType = detectType(buffer).mimeType;
  const acquiredAt = new Date().toISOString();
  return {
    buffer,
    mimeType: declaredMediaType ?? detectedMediaType,
    acquisition: {
      acquiredAt,
      filename: filenameFromContentDisposition(response.headers.get('content-disposition')),
      declaredSize: parseByteSize(response.headers.get('content-length')),
      receivedByteSize: buffer.byteLength,
      httpStatus: response.status,
      redirectOutcome: response.redirected ? 'redirected' : 'not_redirected',
      declaredMediaType,
      detectedMediaType,
    },
  };
}
