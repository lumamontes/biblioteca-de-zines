import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePublicReaderResponse } from '@biblioteca-de-zines/reader';

test('accepts a complete public reader response', () => {
  const response = parsePublicReaderResponse({ status: 'ready', fallback: { label: 'PDF', url: '/zine.pdf' }, publication: { id: 1, slug: 'one', title: 'One' }, manifest: { generationId: 'g1', pageCount: 1, pages: [{ generationId: 'g1', pageNumber: 1, imageUrl: 'https://cdn.test/1.webp', width: 100, height: 140 }] } });
  assert.equal(response.status, 'ready');
});

test('rejects an incomplete manifest instead of mounting a reader', () => {
  assert.throws(() => parsePublicReaderResponse({ status: 'ready', fallback: { label: 'PDF', url: '' }, publication: { id: 1, slug: 'one', title: 'One' }, manifest: { generationId: 'g1', pageCount: 2, pages: [] } }));
});

test('preserves source unavailability as an explicit fallback reason', () => {
  const response = parsePublicReaderResponse({ status: 'fallback', fallback: { label: 'PDF', url: '' }, publication: { id: 1, slug: 'one', title: 'One' }, reason: 'source-unavailable' });
  assert.equal(response.status, 'fallback');
  if (response.status === 'fallback') assert.equal(response.reason, 'source-unavailable');
});
