import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  PdfEmbeddedMetadata,
  SourceMetadataObservation,
} from '../src/application/source-metadata/source-metadata-types';

const validPdf = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  + '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  + '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>\nendobj\n'
  + '4 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\nxref\n0 5\n'
  + '0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n'
  + 'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n268\n%%EOF\n',
);
const nonPdf = Buffer.from('this is not a PDF');
const metadata: PdfEmbeddedMetadata = {
  title: 'Observed title',
  author: 'Observed author',
  subject: 'Observed subject',
  creator: 'Fixture creator',
  producer: 'Fixture producer',
  creationDate: 'D:20240101120000Z',
  modificationDate: 'D:20240201120000Z',
};

test('accepts a successful PDF observation with acquisition and format context', () => {
  const observation = successfulObservation({
    receivedByteSize: validPdf.byteLength,
    declaredMediaType: 'application/octet-stream',
    detectedMediaType: 'application/pdf',
    sourceFilename: 'source.bin',
  });

  assert.equal(observation.status, 'observed');
  assert.equal(observation.declaredMediaType, 'application/octet-stream');
  assert.equal(observation.detectedMediaType, 'application/pdf');
  assert.equal(observation.formatIdentifier, 'fmt/18');
  assert.equal(observation.fixity?.context, 'acquisition');
});

test('records invalid and non-PDF inputs without conflating their outcomes', () => {
  const nonPdfObservation = failedObservation('not_pdf', nonPdf, 'text/plain');
  const invalidPdfObservation = failedObservation('invalid_pdf', Buffer.from('%PDF-1.7\ntruncated'), 'application/pdf');

  assert.equal(nonPdfObservation.status, 'not_pdf');
  assert.equal(nonPdfObservation.detectedMediaType, 'text/plain');
  assert.equal(invalidPdfObservation.status, 'invalid_pdf');
  assert.equal(invalidPdfObservation.detectedMediaType, 'application/pdf');
  assert.notEqual(nonPdfObservation.failureReason, invalidPdfObservation.failureReason);
});

test('records inaccessible sources as acquisition failures', () => {
  const observation = failedObservation('unreachable', null, null);

  assert.equal(observation.status, 'unreachable');
  assert.equal(observation.receivedByteSize, null);
  assert.equal(observation.failureReason, 'connection timed out');
  assert.equal(observation.sourceUri, 'https://example.test/source.pdf');
});

test('keeps embedded PDF metadata separate from catalogue metadata', () => {
  const observation = successfulObservation({ embeddedMetadata: metadata });

  assert.deepEqual(observation.embeddedMetadata, metadata);
  assert.equal('title' in observation, false);
  assert.equal('author' in observation, false);
});

test('records page count and per-page geometry including orientation', () => {
  const observation = successfulObservation({
    pageCount: 2,
    pages: [
      { pageNumber: 1, width: 612, height: 792, orientation: 'portrait' },
      { pageNumber: 2, width: 792, height: 612, orientation: 'landscape' },
    ],
  });

  assert.equal(observation.pageCount, 2);
  assert.deepEqual(observation.pages.map((page) => page.orientation), ['portrait', 'landscape']);
});

test('distinguishes text-layer status from text extraction status', () => {
  const observation = successfulObservation({ textLayerStatus: 'absent', textExtractionStatus: 'not_attempted' });

  assert.equal(observation.textLayerStatus, 'absent');
  assert.equal(observation.textExtractionStatus, 'not_attempted');
});

test('preserves fixity context and comparison detail', () => {
  const observation = successfulObservation({
    fixity: {
      algorithm: 'sha-256',
      digest: 'a'.repeat(64),
      context: 'validation',
      calculatedAt: '2026-01-01T00:00:00.000Z',
      checkStatus: 'mismatch',
      comparisonDetail: 'previous acquisition digest differs',
    },
  });

  assert.equal(observation.fixity?.algorithm, 'sha-256');
  assert.equal(observation.fixity?.context, 'validation');
  assert.equal(observation.fixity?.checkStatus, 'mismatch');
  assert.equal(observation.fixity?.comparisonDetail, 'previous acquisition digest differs');
});

test('records failed extraction outcomes without discarding acquisition context', () => {
  const observation = failedObservation('extraction_failed', validPdf, 'application/pdf');

  assert.equal(observation.status, 'extraction_failed');
  assert.equal(observation.failureReason, 'PDF password required');
  assert.equal(observation.receivedByteSize, validPdf.byteLength);
  assert.equal(observation.declaredMediaType, 'application/pdf');
  assert.equal(observation.pageCount, null);
});

type ObservationOverrides = Partial<SourceMetadataObservation>;

function successfulObservation(overrides: ObservationOverrides = {}): SourceMetadataObservation {
  return {
    ...baseObservation,
    status: 'observed',
    failureReason: null,
    receivedByteSize: validPdf.byteLength,
    declaredMediaType: 'application/pdf',
    detectedMediaType: 'application/pdf',
    formatIdentificationStatus: 'identified',
    formatIdentifier: 'fmt/18',
    pageCount: 1,
    pages: [{ pageNumber: 1, width: 612, height: 792, orientation: 'portrait' }],
    textLayerStatus: 'present',
    textExtractionStatus: 'succeeded',
    embeddedMetadata: null,
    ...overrides,
  };
}

function failedObservation(
  status: SourceMetadataObservation['status'],
  bytes: Uint8Array | null,
  detectedMediaType: string | null,
): SourceMetadataObservation {
  return {
    ...baseObservation,
    status,
    failureReason: status === 'unreachable' ? 'connection timed out' : status === 'extraction_failed' ? 'PDF password required' : `fixture ${status}`,
    receivedByteSize: bytes?.byteLength ?? null,
    declaredMediaType: status === 'unreachable' ? null : detectedMediaType,
    detectedMediaType,
    formatIdentificationStatus: status === 'not_pdf' ? 'identified' : 'unidentified',
    formatIdentifier: null,
    pageCount: null,
    pages: [],
    textLayerStatus: 'not_applicable',
    textExtractionStatus: 'not_attempted',
    embeddedMetadata: null,
  };
}

const baseObservation: SourceMetadataObservation = {
  observationId: 'observation-1',
  publicationId: 42,
  submissionId: null,
  assetKind: 'source',
  observedAt: '2026-01-01T00:00:00.000Z',
  extractorVersion: 'contract-fixture-1',
  sourceUri: 'https://example.test/source.pdf',
  acquisitionMethod: 'generic HTTP',
  acquiredAt: '2026-01-01T00:00:00.000Z',
  status: 'observed',
  failureReason: null,
  sourceFilename: 'source.pdf',
  sourceSize: validPdf.byteLength,
  httpStatus: 200,
  redirectOutcome: 'none',
  receivedByteSize: validPdf.byteLength,
  declaredMediaType: 'application/pdf',
  detectedMediaType: 'application/pdf',
  formatIdentificationStatus: 'identified',
  formatIdentifier: 'fmt/18',
  storageReference: 'sources/observation-1.pdf',
  pageCount: 1,
  pages: [],
  textLayerStatus: 'present',
  textExtractionStatus: 'succeeded',
  embeddedMetadata: null,
  fixity: {
    algorithm: 'sha-256',
    digest: 'b'.repeat(64),
    context: 'acquisition',
    calculatedAt: '2026-01-01T00:00:00.000Z',
    checkStatus: 'not_compared',
    comparisonDetail: null,
  },
  provenanceNote: 'system-observed contract fixture',
  visibility: 'internal',
};
