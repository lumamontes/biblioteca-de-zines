import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { extractSourceObservation } from '../src/domain/source-observation';

const observedAt = new Date('2026-10-17T12:00:00.000Z');
const inspection = {
  tool: 'test-pdf-inspector 1',
  metadata: {
    title: 'A zine', author: 'An author', subject: 'A subject', creator: 'Creator', producer: 'Producer',
    creationDate: 'D:20200101000000Z', modificationDate: null,
  },
  pages: [
    { width: 612, height: 792, text: { status: 'present' as const, extracted: true } },
    { width: 792, height: 792, text: { status: 'absent' as const, extracted: true } },
  ],
};

test('extracts a versioned PDF observation without changing catalogue fields', async () => {
  const buffer = Buffer.from('%PDF-1.7 source bytes');
  const outcome = await extractSourceObservation({
    source: { buffer, mimeType: 'application/octet-stream' },
    sourceUri: 'https://example.test/zine.pdf',
    acquisition: { method: 'http', status: 'acquired', filename: 'zine.pdf', httpStatus: 200, redirectCount: 1 },
  }, async () => inspection, () => observedAt);

  assert.equal(outcome.status, 'observed');
  if (outcome.status !== 'observed') return;
  assert.equal(outcome.observation.observationVersion, 1);
  assert.equal(outcome.observation.extractorVersion, 'pdf-source-observation/v1');
  assert.equal(outcome.observation.pdf.pageCount, 2);
  assert.deepEqual(outcome.observation.pdf.pages.map(({ width, height, orientation }) => ({ width, height, orientation })), [
    { width: 612, height: 792, orientation: 'portrait' },
    { width: 792, height: 792, orientation: 'square' },
  ]);
  assert.deepEqual(outcome.observation.pdf.embeddedMetadata, { ...inspection.metadata, tool: 'test-pdf-inspector 1', extractedAt: observedAt.toISOString() });
  assert.deepEqual(outcome.observation.pdf.textLayer, { status: 'present', pagesWithText: 1, pagesWithoutText: 1, pagesNotChecked: 0 });
   assert.deepEqual(outcome.observation.pdf.textExtraction, { status: 'complete', extractedPages: 2, failedPages: 0, unknownPages: 0 });
  assert.equal(outcome.observation.fixity.digest, createHash('sha256').update(buffer).digest('hex'));
  assert.equal(outcome.observation.fixity.context, 'acquisition');
  assert.equal(outcome.observation.provenance.visibility, 'internal');
});

test('returns typed failures for unavailable and non-PDF sources', async () => {
  const unavailable = await extractSourceObservation({ acquisition: { status: 'unreachable', failureReason: 'timeout' } }, async () => inspection, () => observedAt);
  assert.deepEqual(unavailable, {
    version: 1, status: 'failed', observedAt: observedAt.toISOString(), extractorVersion: 'pdf-source-observation/v1',
     reason: 'unreachable', message: 'timeout', fixity: null, detectedMediaType: null,
     formatIdentification: 'not_attempted', formatIdentifier: null,
  });

  const notPdf = await extractSourceObservation({ source: { buffer: Buffer.from('not a PDF'), mimeType: 'text/plain' } }, async () => inspection, () => observedAt);
  assert.equal(notPdf.status, 'failed');
  if (notPdf.status === 'failed') {
    assert.equal(notPdf.reason, 'not_pdf');
    assert.equal(notPdf.fixity?.algorithm, 'SHA-256');
  }
});

test('keeps PDF inspection failures distinct from invalid signatures', async () => {
  const outcome = await extractSourceObservation({ source: { buffer: Buffer.from('%PDF-1.7'), mimeType: 'application/pdf' } }, async () => {
    throw new Error('text extraction unavailable');
  }, () => observedAt);
  assert.equal(outcome.status, 'failed');
  if (outcome.status === 'failed') assert.equal(outcome.reason, 'extraction_failed');
});

test('preserves unknown and partial text extraction and compares prior fixity', async () => {
  const buffer = Buffer.from('%PDF-1.7 source bytes');
  const digest = createHash('sha256').update(buffer).digest('hex');
  const outcome = await extractSourceObservation({ source: { buffer, mimeType: 'application/pdf' } }, async () => ({
    ...inspection,
    pages: [
      { width: 612, height: 792, text: { status: 'present' as const, extracted: true } },
      { width: 612, height: 792, text: { status: 'unknown' as const, extracted: false } },
    ],
  }), () => observedAt, { algorithm: 'sha-256', digest, context: 'acquisition' });

  assert.equal(outcome.status, 'observed');
  if (outcome.status !== 'observed') return;
  assert.equal(outcome.observation.pdf.textLayer.status, 'present');
  assert.deepEqual(outcome.observation.pdf.textExtraction, { status: 'partial', extractedPages: 1, failedPages: 0, unknownPages: 1 });
  assert.equal(outcome.observation.fixity.checkStatus, 'matched');
  assert.match(outcome.observation.fixity.comparisonDetail ?? '', /matched/);
  assert.equal(outcome.observation.provenance.uncertaintyStatus, 'partial');
});
