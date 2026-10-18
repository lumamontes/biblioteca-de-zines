import assert from 'node:assert/strict';
import test from 'node:test';
import { createSourceMetadataObservation } from '../src/application/source-metadata/source-metadata-observation-factory';

const outcome = {
  version: 1 as const,
  status: 'failed' as const,
  observedAt: '2026-10-17T12:00:00.000Z',
  extractorVersion: 'pdf-source-observation/v1' as const,
  reason: 'unreachable' as const,
  message: 'timeout',
  fixity: null,
  detectedMediaType: null,
  formatIdentification: 'not_attempted' as const,
  formatIdentifier: null,
};
const source = { sourceId: 'publication:42', publicationId: 42, submissionId: null, sourceUri: 'https://example.test/zine.pdf' };
const acquisition = {
  method: 'http', acquiredAt: null, filename: null, declaredSize: null, receivedByteSize: null,
  httpStatus: null, redirectOutcome: null, declaredMediaType: null, detectedMediaType: null,
};

test('keeps local asset identity stable while making same-millisecond observations unique', () => {
  const first = createSourceMetadataObservation(source, outcome, acquisition);
  const second = createSourceMetadataObservation(source, outcome, acquisition);

  assert.equal(first.assetIdentity, 'publication:42');
  assert.equal(second.assetIdentity, first.assetIdentity);
  assert.notEqual(first.observationId, second.observationId);
  assert.match(first.observationId, /^publication:42:2026-10-17T12:00:00\.000Z:[0-9a-f-]{36}$/);
});
