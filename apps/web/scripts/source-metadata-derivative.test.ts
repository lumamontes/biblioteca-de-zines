import assert from 'node:assert/strict';
import test from 'node:test';
import { recordSourceMetadataDerivative } from '../src/application/source-metadata/record-source-metadata-derivative';

test('records a derivative identity linked to its source observation', async () => {
  let recorded: any;
  await recordSourceMetadataDerivative({ create: async (observation) => { recorded = observation; return 2; } }, {
    sourceObservationId: 1,
    observationId: '1:cover:generation-1',
    assetIdentity: 'https://assets.example/zines/42/covers/generation-1.webp',
    assetKind: 'derivative',
    storageReference: 'https://assets.example/zines/42/covers/generation-1.webp',
    mediaType: 'image/webp',
    byteSize: null,
    observedAt: '2026-10-17T12:00:00.000Z',
    provenanceNote: 'Generated derivative linked to the acquired source observation; not an original.',
  });
  assert.equal(recorded.assetKind, 'derivative');
  assert.equal(recorded.sourceObservationId, 1);
  assert.equal(recorded.sourceUri, null);
  assert.match(recorded.provenanceNote, /not an original/);
});
