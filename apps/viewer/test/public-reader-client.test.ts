import assert from 'node:assert/strict';
import test from 'node:test';
import { createReaderRequestController } from '@/infrastructure/public-reader-client';

test('aborts a reader request when its timeout expires', async () => {
  const request = createReaderRequestController(5);

  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.equal(request.signal.aborted, true);
});

test('cancels a reader request immediately', () => {
  const request = createReaderRequestController(1_000);

  request.cancel();

  assert.equal(request.signal.aborted, true);
});
