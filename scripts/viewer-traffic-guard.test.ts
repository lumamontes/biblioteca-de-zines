import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewerTrafficGuard } from '../src/infrastructure/reader/viewer-traffic-guard';

test('limits requests per viewer key within a time window', () => {
  let now = 1000;
  const guard = createViewerTrafficGuard({ limit: 2, now: () => now, windowMs: 100 });

  assert.deepEqual(guard.check('viewer-a'), { allowed: true, remaining: 1 });
  assert.deepEqual(guard.check('viewer-a'), { allowed: true, remaining: 0 });
  assert.deepEqual(guard.check('viewer-a'), { allowed: false, remaining: 0 });

  now += 100;
  assert.deepEqual(guard.check('viewer-a'), { allowed: true, remaining: 1 });
});

test('keeps traffic windows independent by key', () => {
  const guard = createViewerTrafficGuard({ limit: 1, windowMs: 100 });

  assert.equal(guard.check('viewer-a').allowed, true);
  assert.equal(guard.check('viewer-b').allowed, true);
});
