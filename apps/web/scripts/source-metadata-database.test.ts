import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('source metadata migration enforces append-only writes while retaining inserts', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261017010000_enforceSourceMetadataAppendOnly.sql', import.meta.url), 'utf8');
  assert.match(migration, /BEFORE UPDATE OR DELETE ON public\.source_metadata/);
  assert.match(migration, /RAISE EXCEPTION 'source_metadata is append-only/);
  assert.match(migration, /FOREIGN KEY \(source_observation_id\)/);
  assert.match(migration, /ON DELETE RESTRICT/);
  assert.doesNotMatch(migration, /REVOKE INSERT/);
});
