import assert from 'node:assert/strict';
import test from 'node:test';
import { createPublicViewerEmbedUrl, createPublicViewerUrl } from '@/application/reader/viewer-link';

test('creates an encoded URL for the independent public viewer', () => {
  assert.equal(
    createPublicViewerUrl('https://viewer.example/', 'autor/minha zine'),
    'https://viewer.example/viewer/v1/autor%2Fminha%20zine',
  );
});

test('uses the production viewer when no origin is configured', () => {
  assert.equal(
    createPublicViewerUrl(undefined, 'sample'),
    'https://viewer.biblioteca-de-zines.com.br/viewer/v1/sample',
  );
});

test('creates an embed URL for the beta reader', () => {
  assert.equal(
    createPublicViewerEmbedUrl('http://localhost:4100/', 'autor/minha zine'),
    'http://localhost:4100/embed/v1/autor%2Fminha%20zine',
  );
});
