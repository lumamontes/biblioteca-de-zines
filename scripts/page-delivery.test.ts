import assert from 'node:assert/strict';
import test from 'node:test';
import { createPutObjectCommand, generateGenerationKey } from '../src/infrastructure/storage/r2-storage-service';
import {
  createReaderResponseHeaders,
  IMMUTABLE_DERIVATIVE_CACHE_CONTROL,
  REVALIDATABLE_READER_METADATA_CACHE_CONTROL,
} from '../src/infrastructure/storage/cache-policy';

test('page object keys are immutable and generation-scoped', () => {
  const target = { id: 42, kind: 'zine' as const };

  assert.equal(
    generateGenerationKey(target, 'generation-1', 'page', 'webp', 3),
    'zines/42/generations/generation-1/page-3.webp',
  );
  assert.notEqual(
    generateGenerationKey(target, 'generation-1', 'page', 'webp', 3),
    generateGenerationKey(target, 'generation-2', 'page', 'webp', 3),
  );
});

test('derivative and reader metadata caching policies are explicit', () => {
  assert.equal(IMMUTABLE_DERIVATIVE_CACHE_CONTROL, 'public, max-age=31536000, immutable');
  assert.equal(REVALIDATABLE_READER_METADATA_CACHE_CONTROL, 'private, max-age=0, must-revalidate');

  const command = createPutObjectCommand({
    body: Buffer.from('page'),
    bucket: 'pages',
    cacheControl: IMMUTABLE_DERIVATIVE_CACHE_CONTROL,
    contentType: 'image/webp',
    key: 'zines/42/generations/generation-1/page-1.webp',
  });
  assert.equal(command.input.CacheControl, IMMUTABLE_DERIVATIVE_CACHE_CONTROL);

  const headers = createReaderResponseHeaders('https://viewer.example.test', 'https://viewer.example.test');
  assert.equal(headers.get('Cache-Control'), REVALIDATABLE_READER_METADATA_CACHE_CONTROL);
  assert.equal(headers.get('Access-Control-Allow-Origin'), 'https://viewer.example.test');
});
