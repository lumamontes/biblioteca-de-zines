/**
 * Cloudflare R2 Storage Service
 * Handles uploading files to Cloudflare R2 (S3-compatible API)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { AssetStorage } from '@/application/asset-storage';
import type { CoverAssetStore } from '@/application/cover-generation/cover-generation-types';
import { coverObjectKey } from '@/infrastructure/storage/r2-cover-reference';

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

export function generateGenerationKey(
  target: { id: number; kind: 'zine' },
  generationId: string,
  kind: 'page' | 'cover',
  extension: string,
  pageNumber?: number,
): string {
  const ext = extension.startsWith('.') ? extension.slice(1) : extension;
  if (kind === 'cover') return `zines/${target.id}/covers/${generationId}.${ext}`;
  const name = `page-${pageNumber}`;
  return `zines/${target.id}/generations/${generationId}/${name}.${ext}`;
}

export function createR2AssetStorage(): AssetStorage {
  const client = getR2Client();

  return {
    async upload(asset) {
      const extension = asset.contentType.includes('webp')
        ? 'webp'
        : asset.contentType.includes('jpeg') || asset.contentType.includes('jpg')
          ? 'jpg'
          : 'png';
      const key = generateGenerationKey(
        asset.target,
        asset.generationId,
        asset.kind,
        extension,
        asset.pageNumber,
      );
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      if (!bucketName || !publicUrl) throw new Error('R2 bucket and public URL are required');

       await client.send(new PutObjectCommand({
         Bucket: bucketName,
         Key: key,
         Body: asset.data,
         ContentType: asset.contentType,
         CacheControl: 'public, max-age=31536000, immutable',
       }));
      return `${publicUrl.replace(/\/$/, '')}/${key}`;
    },
    async deleteGeneration(target, generationId) {
      await deleteR2Prefix(client, `zines/${target.id}/generations/${generationId}/`);
      await Promise.all(['webp', 'png', 'jpg'].map((extension) => (
        deleteCoverObject(client, target, `${generationId}.${extension}`)
      )));
    },
    deletePageGeneration(target, generationId) {
      return deleteR2Prefix(client, `zines/${target.id}/generations/${generationId}/`);
    },
    async deleteCover(target, coverUrl) {
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
      const key = coverObjectKey(process.env.NEXT_PUBLIC_R2_PUBLIC_URL, target, coverUrl);
      if (!bucketName || !key) return;
      await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    },
    async isCoverAvailable(target, coverUrl) {
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
      const key = coverObjectKey(process.env.NEXT_PUBLIC_R2_PUBLIC_URL, target, coverUrl);
      if (!bucketName || !key) return false;
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export function createR2CoverAssetStore(): CoverAssetStore {
  const storage = createR2AssetStorage();
  return {
    storeCover(asset) {
      return storage.upload({
        data: asset.data,
        contentType: 'image/webp',
        generationId: asset.generationId,
        kind: 'cover',
        target: asset.target,
      });
    },
    discardGeneration: storage.deleteGeneration,
    removeCover: storage.deleteCover,
    isAvailable: storage.isCoverAvailable,
  };
}

async function deleteCoverObject(
  client: S3Client,
  target: { id: number; kind: 'zine' },
  fileName: string,
): Promise<void> {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucketName) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not configured');
  await client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `zines/${target.id}/covers/${fileName}`,
  }));
}

async function deleteR2Prefix(client: S3Client, prefix: string): Promise<void> {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucketName) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not configured');

  let continuationToken: string | undefined;
  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    await Promise.all((response.Contents ?? []).flatMap((object) => (
      object.Key
        ? [client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key }))]
        : []
    )));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
}
