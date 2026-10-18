import assert from 'node:assert/strict';
import test from 'node:test';
import { runSourceMetadataBatch } from '../src/application/source-metadata/run-source-metadata-batch';
import { observeSourceMetadataSource } from '../src/application/source-metadata/observe-source-metadata-source';
import type { SourceMetadataBatchSource } from '../src/application/source-metadata/source-metadata-batch-types';
import type { SourceMetadataObservation } from '../src/application/source-metadata/source-metadata-types';

function observation(status: SourceMetadataObservation['status'], version: string): SourceMetadataObservation {
  return {
    observationId: `${version}-${status}`,
    assetIdentity: `${version}-${status}`,
    sourceObservationId: null,
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
    valueProvenance: {},
    uncertaintyStatus: 'unknown',
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

  assert.deepEqual(first.results.map(({ status }) => status), ['observed', 'unreachable']);
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
  assert.equal(results.results.length, 1);
});

test('continues after failed acquisition and records unknown text status', async () => {
  const sources = [
    { sourceId: 'publication:missing', publicationId: 1, submissionId: null, sourceUri: 'missing' },
    { sourceId: 'publication:unknown-text', publicationId: 2, submissionId: null, sourceUri: 'unknown-text' },
  ];
  const recorded: SourceMetadataObservation[] = [];
  const dependencies = {
    listSources: async () => sources,
    observe: (source: SourceMetadataBatchSource) => observeSourceMetadataSource(source, {
      repository: { findLatestFixity: async () => null },
      download: async (sourceUri: string) => {
        if (sourceUri === 'missing') throw new Error('connection timed out');
        return { buffer: Buffer.from('%PDF-1.4 fixture'), mimeType: 'application/pdf' };
      },
      inspect: async () => ({
        tool: 'fixture',
        metadata: { title: null, author: null, subject: null, creator: null, producer: null, creationDate: null, modificationDate: null },
        pages: [{ width: 612, height: 792, text: { status: 'unknown' as const, extracted: false } }],
      }),
      clock: () => new Date('2026-10-17T12:00:00.000Z'),
    }),
    record: async (item: SourceMetadataObservation) => { recorded.push(item); return recorded.length; },
  };

  const result = await runSourceMetadataBatch(dependencies);

  assert.deepEqual(result.results.map(({ status }) => status), ['unreachable', 'observed']);
  assert.equal(recorded[0]?.textLayerStatus, 'not_applicable');
  assert.equal(recorded[1]?.textLayerStatus, 'unknown');
  assert.equal(recorded.length, 2);
});
