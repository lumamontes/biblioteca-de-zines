import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { createCoverGeneration, optimizeCoverImage } from '../src/services/cover-generation-module';
import type { AssetStorage } from '../src/services/asset-storage';
import type { CoverGenerationRepository } from '../src/services/cover-generation-module';

test('cover generation produces a bounded WebP and publishes it after upload', async () => {
  const source = await createImage(2400, 1800);
  const calls: string[] = [];
  const repository = createRepository(calls);
  const storage = createStorage(calls);

  await createCoverGeneration(
    async () => ({ buffer: source, mimeType: 'image/png' }),
    { id: 42, kind: 'zine' },
    repository,
    storage,
    'https://drive.example/source.pdf',
  );

  const uploaded = storage.uploaded[0];
  assert.equal(uploaded.contentType, 'image/webp');
  assert.deepEqual(await sharp(uploaded.data).metadata().then(({ format, width, height }) => ({ format, width, height })), {
    format: 'webp',
    width: 1600,
    height: 1200,
  });
  assert.deepEqual(calls, ['mark-processing', 'upload', 'publish', 'delete-cover']);
});

test('failed cover generation records failure and removes the new generation', async () => {
  const calls: string[] = [];
  const repository = createRepository(calls);
  const storage = createStorage(calls);

  await assert.rejects(() => createCoverGeneration(
    async () => ({ buffer: Buffer.from('not an image'), mimeType: 'image/png' }),
    { id: 42, kind: 'zine' },
    repository,
    storage,
    'https://drive.example/source.pdf',
  ));

  assert.deepEqual(calls, ['mark-processing', 'mark-failed', 'delete-generation']);
});

test('cover optimization does not enlarge small images', async () => {
  const optimized = await optimizeCoverImage(await createImage(400, 600));
  const metadata = await sharp(optimized).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 400);
  assert.equal(metadata.height, 600);
});

async function createImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: '#d6b48a' },
  }).png().toBuffer();
}

function createRepository(calls: string[]): CoverGenerationRepository {
  return {
    async getState() {
      return { coverImage: 'https://assets.example/zines/42/covers/old.webp' };
    },
    async markFailed() {
      calls.push('mark-failed');
    },
    async markProcessing() {
      calls.push('mark-processing');
    },
    async publish() {
      calls.push('publish');
    },
  };
}

function createStorage(calls: string[]): AssetStorage & { uploaded: Array<{ contentType: string; data: Buffer }> } {
  const uploaded: Array<{ contentType: string; data: Buffer }> = [];
  return {
    uploaded,
    async deleteCover() {
      calls.push('delete-cover');
    },
    async deleteGeneration() {
      calls.push('delete-generation');
    },
    async upload(asset) {
      uploaded.push({ contentType: asset.contentType, data: asset.data });
      calls.push('upload');
      return 'https://assets.example/zines/42/covers/new.webp';
    },
  };
}
