import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCoverMigrationId, runCoverMigration, scopeCoverMigrationZines } from '@/application/cover-generation/cover-migration-runner';
import { getExcludedCoverMigrationIds } from '@/application/cover-generation/cover-migration-report';
import type { CoverMigrationZine } from '@/application/cover-generation/cover-migration-types';

test('dry run selects candidates without processing them', async () => {
  const calls: number[] = [];
  const selected: number[] = [];
  const summary = await runCoverMigration({
    apply: false,
    excludedIds: new Set([3]),
    isReachableImage: async (url) => url === 'https://drive.example/cover.jpg',
    onSelected: (zine) => { selected.push(zine.id); },
    processCandidate: async (zine) => { calls.push(zine.id); },
    zines: [zine(1, ''), zine(2, 'https://drive.example/cover.jpg'), zine(3, '')],
  });

  assert.deepEqual(summary, { completed: 0, failed: 0, selected: 1, skipped: 2 });
  assert.deepEqual(calls, []);
  assert.deepEqual(selected, [1]);
});

test('apply mode continues after one candidate fails and reports a summary', async () => {
  const processed: number[] = [];
  const failures: number[] = [];
  const summary = await runCoverMigration({
    apply: true,
    excludedIds: new Set(),
    isReachableImage: async () => false,
    onFailure: (candidate) => { failures.push(candidate.id); },
    processCandidate: async (candidate) => {
      processed.push(candidate.id);
      if (candidate.id === 2) throw new Error('source unavailable');
    },
    zines: [zine(1, ''), zine(2, ''), zine(3, '')],
  });

  assert.deepEqual(processed, [1, 2, 3]);
  assert.deepEqual(failures, [2]);
  assert.deepEqual(summary, { completed: 2, failed: 1, selected: 3, skipped: 0 });
});

test('already-correct generated covers are skipped on rerun', async () => {
  const current = zine(1, 'https://assets.example/zines/1/covers/current.webp');
  current.import_status = 'completed';
  current.processed_pdf_url = current.pdf_url;

  const summary = await runCoverMigration({
    apply: true,
    excludedIds: new Set(),
    isReachableImage: async () => true,
    processCandidate: async () => { throw new Error('should not process'); },
    zines: [current],
  });

  assert.deepEqual(summary, { completed: 0, failed: 0, selected: 0, skipped: 1 });
});

test('excludes only known invalid monitor resources', () => {
  assert.deepEqual([...getExcludedCoverMigrationIds({
    results: [
      { outcome: 'inaccessible', resourceId: 'library_zines:1' },
      { outcome: 'invalid', resourceId: 'library_zines:2' },
      { outcome: 'invalid-input', resourceId: 'library_zines:3' },
      { outcome: 'ok', resourceId: 'library_zines:4' },
      { outcome: 'invalid', resourceId: 'other:5' },
    ],
  })], [1, 2, 3]);
});

test('scopes and validates explicit migration IDs', () => {
  assert.deepEqual(scopeCoverMigrationZines([zine(1, ''), zine(2, '')], 2).map(({ id }) => id), [2]);
  assert.deepEqual(scopeCoverMigrationZines([zine(1, ''), zine(2, '')]).map(({ id }) => id), [1, 2]);
  assert.equal(parseCoverMigrationId(undefined), undefined);
  assert.equal(parseCoverMigrationId('42'), 42);
  assert.throws(() => parseCoverMigrationId('0'), /positive integer/);
  assert.throws(() => parseCoverMigrationId('abc'), /positive integer/);
});

function zine(id: number, cover_image: string): CoverMigrationZine {
  return {
    cover_image,
    id,
    import_status: 'pending',
    pdf_url: `https://drive.example/${id}.pdf`,
    processed_pdf_url: null,
    title: `Zine ${id}`,
  };
}
