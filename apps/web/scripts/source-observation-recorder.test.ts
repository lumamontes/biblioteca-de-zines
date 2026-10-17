import assert from 'node:assert/strict';
import test from 'node:test';
import { recordSourceObservation } from '../src/application/source-metadata/source-observation-recorder';

test('persists a source observation without turning recorder failures into processing failures', async () => {
  const records: unknown[] = [];
  await recordSourceObservation({
    publicationId: 42,
    sourceUri: 'https://example.test/zine.pdf',
    source: { buffer: Buffer.from('%PDF-1.7'), mimeType: 'application/pdf' },
    acquisition: { method: 'http', status: 'acquired' },
  }, {
    inspectPdf: async () => ({
      tool: 'fixture',
      metadata: { title: null, author: null, subject: null, creator: null, producer: null, creationDate: null, modificationDate: null },
      pages: [{ width: 612, height: 792, text: { status: 'absent', extracted: true } }],
    }),
    repository: { create: async (observation) => { records.push(observation); return 1; } },
    clock: () => new Date('2026-10-17T12:00:00.000Z'),
  });

  assert.equal(records.length, 1);
  assert.equal((records[0] as { publicationId: number }).publicationId, 42);
  assert.equal((records[0] as { assetKind: string }).assetKind, 'source');
  assert.equal((records[0] as { textLayerStatus: string }).textLayerStatus, 'absent');
});

test('records an unreachable source as a failed observation', async () => {
  let status: string | undefined;
  await recordSourceObservation({
    publicationId: 42,
    sourceUri: 'https://example.test/missing.pdf',
    acquisition: { method: 'http', status: 'unreachable', failureReason: 'timeout' },
  }, {
    inspectPdf: async () => { throw new Error('not called'); },
    repository: { create: async (observation) => { status = observation.status; return 1; } },
    clock: () => new Date('2026-10-17T12:00:00.000Z'),
  });

  assert.equal(status, 'unreachable');
});
