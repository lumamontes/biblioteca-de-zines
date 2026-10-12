import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { createCoverGeneration } from '../src/application/cover-generation-service';
import { selectCoverMigrationCandidates } from '../src/application/cover-migration-service';
import { isCompleteGeneratedCover } from '../src/application/cover-generation-policy';
import { optimizeCoverImage } from '../src/infrastructure/cover-generation/cover-image-optimizer';
import { generateGenerationKey } from '../src/services/r2-storage-service';
import type { AssetStorage } from '../src/application/asset-storage';
import type { CoverGenerationRepository } from '../src/application/cover-generation-service';

test('cover generation produces a bounded WebP and publishes it after upload', async () => {
  const source = await createImage(2400, 1800);
  const calls: string[] = [];
  const repository = createRepository(calls);
  const storage = createStorage(calls);

  await createCoverGeneration(
    async () => ({ buffer: source, mimeType: 'application/pdf' }),
    { id: 42, kind: 'zine' },
    repository,
    storage,
    'https://drive.example/source.pdf',
    async () => source,
    optimizeCoverImage,
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
    async () => Buffer.from('not an image'),
    optimizeCoverImage,
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

test('cover storage uses the immutable WebP cover namespace', () => {
  assert.equal(
    generateGenerationKey({ id: 42, kind: 'zine' }, 'generation-1', 'cover', 'webp'),
    'zines/42/covers/generation-1.webp',
  );
});

test('migration selects missing and unreachable generated covers only', async () => {
  const previousPublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://assets.example';
  try {
    const candidates = await selectCoverMigrationCandidates([
      createMigrationZine(1, '/zines.png'),
      createMigrationZine(2, 'https://external.example/cover.jpg'),
      createMigrationZine(3, 'https://assets.example/zines/3/covers/old.webp'),
      createMigrationZine(4, 'https://assets.example/zines/4/covers/old.webp'),
    ], new Set([5]), async (url) => url !== 'https://assets.example/zines/4/covers/old.webp');

    assert.deepEqual(candidates.map((zine) => zine.id), [1, 4]);
  } finally {
    if (previousPublicUrl === undefined) delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    else process.env.NEXT_PUBLIC_R2_PUBLIC_URL = previousPublicUrl;
  }
});

test('cover reuse requires the same source and the current zine generated cover', () => {
  const previousPublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://assets.example';
  try {
    const record = {
      cover_image: 'https://assets.example/zines/42/covers/old.webp',
      import_status: 'completed',
      processed_pdf_url: 'https://drive.example/source.pdf',
    };
    assert.equal(isCompleteGeneratedCover(record, 42, record.processed_pdf_url), true);
    assert.equal(isCompleteGeneratedCover(record, 42, 'https://drive.example/changed.pdf'), false);
    assert.equal(isCompleteGeneratedCover(record, 7, record.processed_pdf_url), false);
  } finally {
    if (previousPublicUrl === undefined) delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    else process.env.NEXT_PUBLIC_R2_PUBLIC_URL = previousPublicUrl;
  }
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

function createMigrationZine(id: number, cover_image: string): {
  cover_image: string;
  id: number;
  import_status: string;
  pdf_url: string;
  processed_pdf_url: string;
  title: string;
} {
  return {
    cover_image,
    id,
    import_status: 'completed',
    pdf_url: `https://drive.example/${id}.pdf`,
    processed_pdf_url: `https://drive.example/${id}.pdf`,
    title: `Zine ${id}`,
  };
}
