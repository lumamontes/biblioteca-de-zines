import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewerPreflightHeaders, VIEWER_ALLOWED_HEADERS } from '../src/application/reader/viewer-cors';

test('allows the beta token header only from the configured viewer origin', () => {
  const headers = createViewerPreflightHeaders('https://viewer.example.test', 'https://viewer.example.test');
  assert.equal(headers.get('Access-Control-Allow-Origin'), 'https://viewer.example.test');
  assert.equal(headers.get('Access-Control-Allow-Headers'), VIEWER_ALLOWED_HEADERS);
  assert.equal(createViewerPreflightHeaders('https://other.example.test', 'https://viewer.example.test').get('Access-Control-Allow-Origin'), null);
});
