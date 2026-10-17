import assert from 'node:assert/strict';
import test from 'node:test';
import { runSourceMetadataBatch } from '../src/application/source-metadata/run-source-metadata-batch';
import type { SourceMetadataBatchSource } from '../src/application/source-metadata/source-metadata-batch-types';
import type { SourceMetadataObservation } from '../src/application/source-metadata/source-metadata-types';

function observation(status: SourceMetadataObservation['status'], version: string): SourceMetadataObservation {
  return {
    observationId: `${version}-${status}`,
    publicationId: 1,
    submissionId: null,
    assetKind: 'source',
    observedAt: '2026-10-17T12:00:00.000Z',
    extractorVersion: version,
    sourceUri: 'https://example.test/source.pdf',
    acquisitionMethod: 'http',
    acquiredAt: '2026-10-17T12:00:00.000Z',
    status,
    failureReason: status === 'observed' ? null : 'source unavailable',
    sourceFilename: 'source.pdf',
    sourceSize: null,
    httpStatus: status === 'unreachable' ? 503 : 200,
    redirectOutcome: 'none',
    receivedByteSize: null,
    declaredMediaType: null,
    detectedMediaType: null,
    formatIdentificationStatus: 'not_attempted',
    formatIdentifier: null,
    storageReference: null,
    pageCount: null,
    pages: [],
    textLayerStatus: 'not_applicable',
    textExtractionStatus: 'not_attempted',
    embeddedMetadata: null,
    fixity: null,
    provenanceNote: null,
    visibility: 'internal',
  };
}

test('records every source, including failures, and appends extractor reruns', async () => {
  const sources = [
    { sourceId: 'publication:1', publicationId: 1, submissionId: null, sourceUri: 'https://example.test/ok.pdf' },
    { sourceId: 'publication:2', publicationId: 2, submissionId: null, sourceUri: 'https://example.test/missing.pdf' },
  ];
  const recorded: SourceMetadataObservation[] = [];
  let version = 'pdf-source-observation/v1';
  const dependencies = {
    listSources: async () => sources,
    observe: async (source: SourceMetadataBatchSource) => observation(source.publicationId === 2 ? 'unreachable' : 'observed', version),
    record: async (item: SourceMetadataObservation) => {
      recorded.push(item);
      return recorded.length;
    },
  };

  const first = await runSourceMetadataBatch(dependencies);
  version = 'pdf-source-observation/v2';
  const second = await runSourceMetadataBatch(dependencies);

  assert.deepEqual(first.map(({ status }) => status), ['observed', 'unreachable']);
  assert.deepEqual(recorded.slice(2).map(({ extractorVersion, status }) => `${extractorVersion}-${status}`), [
    'pdf-source-observation/v2-observed', 'pdf-source-observation/v2-unreachable',
  ]);
  assert.equal(recorded.length, 4);
  assert.deepEqual(recorded.map(({ extractorVersion }) => extractorVersion), [
    'pdf-source-observation/v1', 'pdf-source-observation/v1',
    'pdf-source-observation/v2', 'pdf-source-observation/v2',
  ]);
});

test('supports limiting a batch without changing source order', async () => {
  const seen: string[] = [];
  const sources = [
    { sourceId: 'publication:1', publicationId: 1, submissionId: null, sourceUri: 'one' },
    { sourceId: 'publication:2', publicationId: 2, submissionId: null, sourceUri: 'two' },
  ];
  const results = await runSourceMetadataBatch({
    listSources: async () => sources,
    observe: async (source) => { seen.push(source.sourceId); return observation('observed', 'v1'); },
    record: async () => 1,
  }, { limit: 1 });

  assert.deepEqual(seen, ['publication:1']);
  assert.equal(results.length, 1);
});
