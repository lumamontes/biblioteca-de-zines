import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewerReaderHttpResponse } from '../src/app/api/public-reader/viewer-reader-response';

test('maps an available viewer reader to a safe success response', () => {
  const response = createViewerReaderHttpResponse({
    reader: { status: 'fallback', fallback: { label: 'Open PDF', url: '/zine.pdf' }, reason: 'page-generation-unavailable' },
    status: 'available',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'fallback');
});

test('does not expose content for unavailable or unknown publications', () => {
  assert.deepEqual(createViewerReaderHttpResponse({ status: 'unavailable' }), {
    body: { error: 'Reader unavailable' },
    status: 404,
  });
  assert.deepEqual(createViewerReaderHttpResponse({ status: 'not-found' }), {
    body: { error: 'Publication not found' },
    status: 404,
  });
});
