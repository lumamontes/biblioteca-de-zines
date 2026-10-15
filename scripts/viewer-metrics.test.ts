import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewerRequestMetric } from '../src/application/reader/viewer-metrics';

test('attributes public-reader metrics to their surface and embed origin', () => {
  assert.deepEqual(createViewerRequestMetric('ready', 'zine', 'embed', 'https://embed.example'), {
    event: 'public_reader_request',
    origin: 'https://embed.example',
    slug: 'zine',
    status: 'ready',
    surface: 'embed',
  });
});
