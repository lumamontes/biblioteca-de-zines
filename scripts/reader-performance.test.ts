import assert from 'node:assert/strict';
import test from 'node:test';
import { createReaderPerformancePlan } from '../src/infrastructure/reader/performance-plan';

test('plans first, adjacent, and revisit requests in page order', () => {
  assert.deepEqual(createReaderPerformancePlan('https://biblioteca.example/api/public-reader/zine', [
    { imageUrl: '/page-3.webp', pageNumber: 3 },
    { imageUrl: '/page-1.webp', pageNumber: 1 },
    { imageUrl: '/page-2.webp', pageNumber: 2 },
  ]), {
    adjacentPageUrls: ['/page-2.webp', '/page-3.webp'],
    firstPageUrl: '/page-1.webp',
    manifestUrl: 'https://biblioteca.example/api/public-reader/zine?surface=embed',
  });
});

test('does not invent a performance plan for an empty generation', () => {
  assert.throws(() => createReaderPerformancePlan('/api/public-reader/zine', []), /at least one page/);
});
