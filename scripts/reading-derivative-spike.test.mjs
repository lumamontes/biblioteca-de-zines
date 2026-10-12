import assert from 'node:assert/strict';
import test from 'node:test';

import { createSummary } from './reading-derivative-spike.mjs';

const portrait = { first: { width: 600, height: 800 }, minWidth: 600, maxWidth: 600, minHeight: 800, maxHeight: 800, orientation: { portrait: 1, landscape: 0, square: 0 } };

test('summarizes public and unpublished PDFs separately', () => {
  const summary = createSummary([
    { relativePath: 'one.pdf', size: 100, pdf: { status: 'valid', pageCount: 4, dimensions: portrait } },
    { relativePath: 'two.pdf', size: 200, pdf: { status: 'valid', pageCount: 6, dimensions: portrait } },
    { relativePath: 'unpublished/three.pdf', size: 300, pdf: { status: 'valid', pageCount: 2, dimensions: portrait } },
    { relativePath: 'broken.pdf', size: 400, pdf: { status: 'invalid', error: 'bad PDF' } },
  ]);

  assert.equal(summary.validPdfCount, 3);
  assert.equal(summary.publicPdfCount, 2);
  assert.equal(summary.unpublishedPdfCount, 1);
  assert.equal(summary.invalidPdfCount, 1);
  assert.equal(summary.totalPages, 12);
  assert.equal(summary.pageCount.min, 2);
  assert.equal(summary.pageCount.median, 4);
  assert.equal(summary.pageCount.p90, 4);
  assert.equal(summary.estimates[0].publicBytes, 2_500_000);
});
