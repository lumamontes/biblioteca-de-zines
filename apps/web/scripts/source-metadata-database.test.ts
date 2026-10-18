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

test('source metadata migration accepts extractor and derivative text statuses', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261017000000_addSourceMetadata.sql', import.meta.url), 'utf8');
  assert.match(migration, /text_layer_status[\s\S]*'unknown'[\s\S]*'not_applicable'/);
  assert.match(migration, /extraction_status[\s\S]*'not_applicable'/);
});

test('source metadata migration has a collision-safe observation id default', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261017020000_makeSourceObservationIdsCollisionSafe.sql', import.meta.url), 'utf8');
  assert.match(migration, /observation_id SET DEFAULT gen_random_uuid\(\)::TEXT/);
});
