import assert from 'node:assert/strict';
import test from 'node:test';
import { parseProcessingOptions } from './process-pending-zines-options';

test('targeted force processing requires a zine id', () => {
  assert.throws(() => parseProcessingOptions(['--force']), /--force requires --only-id/);
});

test('targeted force processing parses the id and worker options', () => {
  assert.deepEqual(parseProcessingOptions([
    '--only-id', '373', '--force', '--limit', '1', '--concurrency', '1',
  ]), {
    concurrency: 1,
    force: true,
    limit: 1,
    onlyId: 373,
  });
});

test('normal processing keeps the queue defaults', () => {
  assert.deepEqual(parseProcessingOptions([]), {
    concurrency: 2,
    force: false,
    limit: 10,
    onlyId: undefined,
  });
});
