/**
 * File Type Detection Utility
 * Detects file types from buffer content (magic bytes) when MIME types are unreliable
 */

/**
 * Detect file type from buffer content using magic bytes
 */
export function detectFileTypeFromBuffer(buffer: Buffer): {
  mimeType: string;
  extension: string;
} {
  if (buffer.length < 4) {
    return { mimeType: 'application/octet-stream', extension: 'bin' };
  }

  // PDF: starts with %PDF
  if (buffer.subarray(0, 4).toString() === '%PDF') {
    return { mimeType: 'application/pdf', extension: 'pdf' };
  }

  // PNG: starts with 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { mimeType: 'image/png', extension: 'png' };
  }

  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // GIF: starts with GIF87a or GIF89a
  if (
    (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && buffer[4] === 0x37 && buffer[5] === 0x61) ||
    (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && buffer[4] === 0x39 && buffer[5] === 0x61)
  ) {
    return { mimeType: 'image/gif', extension: 'gif' };
  }

  // WebP: starts with RIFF and contains WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }

  // Default to octet-stream if we can't detect
  return { mimeType: 'application/octet-stream', extension: 'bin' };
}

