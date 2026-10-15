import assert from 'node:assert/strict';
import test from 'node:test';
import { isViewerEvent } from '../src/application/reader/viewer-events';

test('accepts only the viewer telemetry events owned by the public reader boundary', () => {
  assert.equal(isViewerEvent({ slug: 'test-zine', surface: 'embed', type: 'ready' }), true);
  assert.equal(isViewerEvent({ slug: 'test-zine', surface: 'reader', type: 'page-error' }), true);
  assert.equal(isViewerEvent({ slug: 'test-zine', surface: 'embed', type: 'fallback' }), true);
  assert.equal(isViewerEvent({ slug: 'test-zine', surface: 'embed', type: 'request-database' }), false);
  assert.equal(isViewerEvent({ slug: 42, surface: 'embed', type: 'ready' }), false);
});

test('accepts page-load timing and byte metrics', () => {
  assert.equal(isViewerEvent({
    durationMs: 125.5,
    metadataBytes: 2048,
    slug: 'zine',
    surface: 'embed',
    type: 'page-load',
  }), true);
  assert.equal(isViewerEvent({
    metadataBytes: -1,
    slug: 'zine',
    surface: 'embed',
    type: 'page-load',
  }), false);
});
