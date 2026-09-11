/**
 * Cloudflare R2 Storage Service
 * Handles uploading files to Cloudflare R2 (S3-compatible API)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Initialize S3 client for R2
function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured. Please set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Generate R2 storage key for a zine page
 * Format: zines/{zineId}/page-{pageNumber}.{extension}
 */
export function generateR2Key(zineId: number, pageNumber: number, extension: string): string {
  // Remove leading dot from extension if present
  const ext = extension.startsWith('.') ? extension.slice(1) : extension;
  return `zines/${zineId}/page-${pageNumber}.${ext}`;
}

/**
 * Upload buffer to R2 and return public URL
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!bucketName) {
    throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not configured');
  }

  if (!publicUrl) {
    throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  try {
    await client.send(command);
    // Return public URL
    const urlKey = key.startsWith('/') ? key.slice(1) : key;
    return `${publicUrl}/${urlKey}`;
  } catch (error) {
    throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete all images for a zine from R2
 * Used for cleanup on failed imports or re-imports
 */
export async function deleteZineImages(zineId: number): Promise<void> {
  const client = getR2Client();
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not configured');
  }

  const prefix = `zines/${zineId}/`;

  try {
    // List all objects with the prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const listResponse = await client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return; // No files to delete
    }

    // Delete all objects
    const deletePromises = listResponse.Contents.map((object) => {
      if (!object.Key) return Promise.resolve();
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: object.Key,
      });
      return client.send(deleteCommand);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(`Failed to delete zine images from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

