import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewerSecurityHeaders } from '../src/infrastructure/reader/viewer-security';

test('allows public embedding only on the embed surface', () => {
  const headers = createViewerSecurityHeaders('embed');

  assert.deepEqual(headers.find(({ key }) => key === 'Content-Security-Policy'), {
    key: 'Content-Security-Policy',
    value: 'frame-ancestors *',
  });
});

test('limits the full viewer surface to Biblioteca hosts', () => {
  const headers = createViewerSecurityHeaders('viewer');

  assert.deepEqual(headers.find(({ key }) => key === 'Content-Security-Policy'), {
    key: 'Content-Security-Policy',
    value: 'frame-ancestors https://biblioteca-de-zines.com.br https://viewer.biblioteca-de-zines.com.br',
  });
  assert.equal(headers.find(({ key }) => key === 'Permissions-Policy')?.value, 'fullscreen=(self)');
});

test('uses the configured viewer origin for non-production deployments', () => {
  const headers = createViewerSecurityHeaders('viewer', 'https://viewer.staging.example.test');

  assert.equal(
    headers.find(({ key }) => key === 'Content-Security-Policy')?.value,
    'frame-ancestors https://biblioteca-de-zines.com.br https://viewer.staging.example.test',
  );
});
