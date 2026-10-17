BEGIN;

-- The application adds a UUID to each observation ID. Keep the database default
-- safe for other append-only writers that omit the human-readable ID.
ALTER TABLE public.source_metadata
  ALTER COLUMN observation_id SET DEFAULT gen_random_uuid()::TEXT;

COMMIT;
