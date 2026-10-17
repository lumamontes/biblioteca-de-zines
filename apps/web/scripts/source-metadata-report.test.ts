import assert from 'node:assert/strict';
import test from 'node:test';
import { createSourceMetadataReport } from '../src/application/source-metadata/create-source-metadata-report';
import type { SourceMetadataObservation } from '../src/application/source-metadata/source-metadata-types';

const observation = (overrides: Partial<SourceMetadataObservation> = {}): SourceMetadataObservation => ({
  observationId: 'one', publicationId: 1, submissionId: null, assetKind: 'source', observedAt: '2026-01-01',
  extractorVersion: 'test', sourceUri: 'https://example.test/zine.pdf', acquisitionMethod: 'http', acquiredAt: '2026-01-01',
  status: 'observed', failureReason: null, sourceFilename: null, sourceSize: 1, httpStatus: 200, redirectOutcome: null,
  receivedByteSize: 1, declaredMediaType: 'application/pdf', detectedMediaType: 'application/pdf', formatIdentificationStatus: 'identified',
  formatIdentifier: 'application/pdf', storageReference: null, pageCount: 1, pages: [], textLayerStatus: 'present',
  textExtractionStatus: 'succeeded', embeddedMetadata: null, fixity: {
    algorithm: 'sha-256', digest: 'digest', context: 'acquisition', calculatedAt: '2026-01-01', checkStatus: 'not_compared', comparisonDetail: null,
   }, provenanceNote: null, valueProvenance: {}, uncertaintyStatus: 'complete', visibility: 'internal', ...overrides,
});

test('reports duplicate fixity, failed sources, missing text, and metadata conflicts', () => {
  const report = createSourceMetadataReport([
    { observation: observation() },
    { observation: observation({ observationId: 'two', textLayerStatus: 'absent', embeddedMetadata: { title: 'Observed', author: 'Different', subject: null, creator: null, producer: null, creationDate: null, modificationDate: null } }), catalogue: { title: 'Catalogue', author: 'Different' } },
    { observation: observation({ observationId: 'three', status: 'extraction_failed', failureReason: 'protected', fixity: null }) },
  ]);

  assert.deepEqual(report.duplicateChecksums, [{ digest: 'digest', observationIds: ['one', 'two'] }]);
  assert.deepEqual(report.failedSources, [{ observationId: 'three', status: 'extraction_failed', reason: 'protected' }]);
  assert.deepEqual(report.missingTextLayers, ['two']);
  assert.deepEqual(report.metadataConflicts, [{ observationId: 'two', field: 'title', catalogueValue: 'Catalogue', observedValue: 'Observed' }]);
});
