BEGIN;

CREATE TABLE IF NOT EXISTS public.source_metadata (
  id BIGSERIAL PRIMARY KEY,
  observation_id TEXT NOT NULL UNIQUE,
  library_zine_id INTEGER REFERENCES public.library_zines(id) ON DELETE SET NULL,
  form_upload_id INTEGER REFERENCES public.form_uploads(id) ON DELETE SET NULL,
  source_reference TEXT,
  asset_kind TEXT NOT NULL DEFAULT 'source'
    CHECK (asset_kind IN ('source', 'reading-copy', 'preview', 'derivative')),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extractor_version TEXT NOT NULL,

  source_uri TEXT,
  acquisition_method TEXT,
  acquired_at TIMESTAMPTZ,
  status TEXT NOT NULL
    CHECK (status IN ('observed', 'unreachable', 'not_pdf', 'invalid_pdf', 'protected', 'extraction_failed')),
  failure_reason TEXT,
  source_filename TEXT,
  source_size_bytes BIGINT CHECK (source_size_bytes IS NULL OR source_size_bytes >= 0),
  http_status INTEGER CHECK (http_status IS NULL OR http_status BETWEEN 100 AND 599),
  redirect_outcome TEXT,

  received_byte_size BIGINT CHECK (received_byte_size IS NULL OR received_byte_size >= 0),
  declared_media_type TEXT,
  detected_media_type TEXT,
  format_identification_status TEXT
    CHECK (format_identification_status IS NULL OR format_identification_status IN ('identified', 'unidentified', 'failed', 'not_attempted')),
  format_identifier TEXT,
  storage_key TEXT,
  pdf_page_count INTEGER CHECK (pdf_page_count IS NULL OR pdf_page_count >= 0),
  page_observations JSONB,
  text_layer_status TEXT
    CHECK (text_layer_status IS NULL OR text_layer_status IN ('present', 'absent', 'partial', 'not_checked', 'failed')),
  extraction_status TEXT
    CHECK (extraction_status IS NULL OR extraction_status IN ('completed', 'partial', 'failed', 'not_attempted')),

  embedded_metadata JSONB,
  fixity_algorithm TEXT,
  fixity_digest TEXT,
  fixity_context TEXT
    CHECK (fixity_context IS NULL OR fixity_context IN ('acquisition', 'validation', 'storage-check', 'delivery')),
  fixity_calculated_at TIMESTAMPTZ,
  fixity_check_status TEXT,
  fixity_comparison_detail TEXT,

  provenance_note TEXT,
  value_provenance JSONB,
  uncertainty_status TEXT,
  visibility_state TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility_state IN ('private', 'internal')),
  CONSTRAINT source_metadata_reference_check
    CHECK (library_zine_id IS NOT NULL OR form_upload_id IS NOT NULL OR source_reference IS NOT NULL),
  CONSTRAINT source_metadata_fixity_pair_check
    CHECK (
      (fixity_algorithm IS NULL AND fixity_digest IS NULL AND fixity_context IS NULL)
      OR (fixity_algorithm IS NOT NULL AND fixity_digest IS NOT NULL AND fixity_context IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_source_metadata_library_zine_id
  ON public.source_metadata(library_zine_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_source_metadata_form_upload_id
  ON public.source_metadata(form_upload_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_source_metadata_source_reference
  ON public.source_metadata(source_reference);

CREATE INDEX IF NOT EXISTS idx_source_metadata_status
  ON public.source_metadata(status, observed_at DESC);

ALTER TABLE public.source_metadata ENABLE ROW LEVEL SECURITY;

COMMIT;
