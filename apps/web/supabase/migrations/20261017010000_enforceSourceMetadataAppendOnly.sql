BEGIN;

ALTER TABLE public.source_metadata
  ADD COLUMN IF NOT EXISTS asset_identity TEXT,
  ADD COLUMN IF NOT EXISTS source_observation_id BIGINT;

UPDATE public.source_metadata
SET asset_identity = observation_id
WHERE asset_identity IS NULL;

ALTER TABLE public.source_metadata
  ALTER COLUMN asset_identity SET NOT NULL,
  DROP CONSTRAINT IF EXISTS source_metadata_library_zine_id_fkey,
  DROP CONSTRAINT IF EXISTS source_metadata_form_upload_id_fkey,
  ADD CONSTRAINT source_metadata_source_observation_fkey
    FOREIGN KEY (source_observation_id) REFERENCES public.source_metadata(id) ON DELETE RESTRICT,
  ADD CONSTRAINT source_metadata_library_zine_id_fkey
    FOREIGN KEY (library_zine_id) REFERENCES public.library_zines(id) ON DELETE RESTRICT,
  ADD CONSTRAINT source_metadata_form_upload_id_fkey
    FOREIGN KEY (form_upload_id) REFERENCES public.form_uploads(id) ON DELETE RESTRICT,
  ADD CONSTRAINT source_metadata_derivative_link_check
    CHECK (asset_kind = 'source' AND source_observation_id IS NULL OR asset_kind <> 'source' AND source_observation_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_source_metadata_source_observation_id
  ON public.source_metadata(source_observation_id);

CREATE OR REPLACE FUNCTION public.reject_source_metadata_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'source_metadata is append-only; % is not permitted', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS source_metadata_append_only ON public.source_metadata;
CREATE TRIGGER source_metadata_append_only
  BEFORE UPDATE OR DELETE ON public.source_metadata
  FOR EACH ROW EXECUTE FUNCTION public.reject_source_metadata_mutation();

COMMIT;
