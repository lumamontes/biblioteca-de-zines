import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { createCoverGeneration } from '../src/application/cover-generation/cover-generation-service';
import { selectCoverMigrationCandidates } from '../src/application/cover-generation/cover-migration-service';
import { isCompleteGeneratedCover } from '../src/application/cover-generation/cover-generation-policy';
import { optimizeCoverImage } from '../src/infrastructure/cover-generation/cover-image-optimizer';
import { generateGenerationKey } from '../src/infrastructure/storage/r2-storage-service';
import { coverObjectKey } from '../src/infrastructure/storage/r2-cover-reference';
import type {
  CoverAssetStore,
  CoverGenerationRepository,
} from '../src/application/cover-generation/cover-generation-types';

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

test('stale cover generation is discarded without deleting the active cover', async () => {
  const calls: string[] = [];
  const repository = createRepository(calls, false);
  const storage = createStorage(calls);

  await createCoverGeneration(
    async () => ({ buffer: Buffer.from('%PDF stale'), mimeType: 'application/pdf' }),
    { id: 42, kind: 'zine' },
    repository,
    storage,
    'https://drive.example/source.pdf',
    async () => Buffer.from('rendered'),
    async (image) => image,
  );

  assert.deepEqual(calls, ['mark-processing', 'upload', 'publish', 'delete-generation']);
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

test('cover storage accepts only generated cover URLs from the configured public domain', () => {
  const target = { id: 42, kind: 'zine' as const };
  assert.equal(
    coverObjectKey('https://assets.example', target, 'https://assets.example/zines/42/covers/generation-1.webp'),
    'zines/42/covers/generation-1.webp',
  );
  assert.equal(
    coverObjectKey('https://assets.example', target, 'https://other.example/zines/42/covers/generation-1.webp'),
    null,
  );
  assert.equal(
    coverObjectKey('https://assets.example', target, 'https://assets.example/zines/42/covers/generation-1.png'),
    null,
  );
});

test('migration selects missing and unreachable generated covers while preserving custom covers', async () => {
  const previousPublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://assets.example';
  try {
    const candidates = await selectCoverMigrationCandidates([
      createMigrationZine(1, '/zines.png'),
      createMigrationZine(2, 'https://drive.google.com/open?id=cover-2'),
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

function createRepository(calls: string[], activated = true): CoverGenerationRepository {
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
      return activated;
    },
  };
}

function createStorage(calls: string[]): CoverAssetStore & { uploaded: Array<{ data: Buffer }> } {
  const uploaded: Array<{ data: Buffer }> = [];
  return {
    uploaded,
    async removeCover() {
      calls.push('delete-cover');
    },
    async discardGeneration() {
      calls.push('delete-generation');
    },
    async isAvailable() {
      return true;
    },
    async storeCover(asset) {
      uploaded.push({ data: asset.data });
      calls.push('upload');
      return 'https://assets.example/zines/42/covers/new.webp';
    },
  };
}

function createMigrationZine(id: number, cover_image: string) {
  return {
    active_page_generation: null,
    cover_image,
    id,
    import_status: 'completed',
    pdf_url: `https://drive.example/${id}.pdf`,
    processed_pdf_url: `https://drive.example/${id}.pdf`,
    title: `Zine ${id}`,
  };
}
