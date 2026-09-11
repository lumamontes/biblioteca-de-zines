/**
 * Google Drive Service
 * Handles extraction of file IDs and downloading files from Google Drive
 * Uses direct download URLs - no API key required for public files
 */

import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';

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
export async function downloadFile(fileId: string): Promise<{ buffer: Buffer; mimeType: string }> {
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
    throw new Error(`Failed to download file from Google Drive: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  let mimeType = response.headers.get('content-type') || 'application/octet-stream';

  // If we got application/octet-stream, try to detect from file content
  if (mimeType === 'application/octet-stream' || !mimeType) {
    const detected = detectFileTypeFromBuffer(buffer);
    mimeType = detected.mimeType;
  }

  return { buffer, mimeType };
}

