/**
 * Google Drive Service
 * Handles extraction of file IDs and downloading files from Google Drive
 * Uses direct download URLs - no API key required for public files
 */

import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import { SourceAcquisitionError, type SourceDocument } from '@/domain/source-document';

/**
 * Extract file ID from Google Drive URL
 * Supports formats like:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/preview?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/edit
 */
export function extractFileIdFromUrl(url: string): string {
  const match = url.match(/\/file\/d\/([^\/\?]+)/);
  if (!match || !match[1]) {
    throw new Error('Invalid Google Drive URL format. Expected: https://drive.google.com/file/d/FILE_ID/...');
  }
  return match[1];
}

/**
 * Convert file ID to direct download URL
 * Uses the uc?export=download endpoint for public files
 */
export function getDirectDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Download file from Google Drive and return buffer with MIME type
 * Handles large files and detects content type from response headers
 */
export async function downloadFile(fileId: string): Promise<SourceDocument> {
  const downloadUrl = getDirectDownloadUrl(fileId);
  
  // For large files, Google Drive may redirect to a virus scan warning
  // We need to handle the confirmation step
  let response = await fetch(downloadUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  // If we get HTML, it might be a virus scan warning page
  // Try to extract the actual download link or use alternative method
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('text/html')) {
    // For large files, try the alternative download method
    const alternativeUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    response = await fetch(alternativeUrl, {
      method: 'GET',
      redirect: 'follow',
    });
  }

  if (!response.ok) {
    throw new SourceAcquisitionError(`Failed to download file from Google Drive: ${response.status} ${response.statusText}`, {
      acquiredAt: new Date().toISOString(), filename: filenameFromContentDisposition(response.headers.get('content-disposition')),
      declaredSize: parseByteSize(response.headers.get('content-length')), receivedByteSize: null, httpStatus: response.status,
      redirectOutcome: response.redirected ? 'redirected' : 'not_redirected', declaredMediaType: response.headers.get('content-type'), detectedMediaType: 'application/octet-stream',
    });
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const declaredMediaType = response.headers.get('content-type');
  const detectedMediaType = detectFileTypeFromBuffer(buffer).mimeType;
  return {
    buffer,
    mimeType: declaredMediaType ?? detectedMediaType,
    acquisition: {
      acquiredAt: new Date().toISOString(),
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

function filenameFromContentDisposition(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1] ?? match[2]) : null;
}

function parseByteSize(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}
