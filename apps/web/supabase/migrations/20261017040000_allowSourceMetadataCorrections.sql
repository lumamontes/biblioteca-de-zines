BEGIN;

DROP TRIGGER IF EXISTS source_metadata_append_only
  ON public.source_metadata;

DROP FUNCTION IF EXISTS public.reject_source_metadata_mutation();

COMMIT;
