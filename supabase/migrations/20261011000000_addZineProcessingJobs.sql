BEGIN;

ALTER TABLE public.library_zines
  ADD COLUMN IF NOT EXISTS source_upload_id INTEGER REFERENCES public.form_uploads(id),
  ADD COLUMN IF NOT EXISTS active_page_generation TEXT NOT NULL DEFAULT 'legacy';

CREATE UNIQUE INDEX IF NOT EXISTS library_zines_source_upload_id_key
  ON public.library_zines(source_upload_id)
  WHERE source_upload_id IS NOT NULL;

ALTER TABLE public.zine_pages
  ADD COLUMN IF NOT EXISTS generation_id TEXT NOT NULL DEFAULT 'legacy';

ALTER TABLE public.zine_pages
  DROP CONSTRAINT IF EXISTS unique_zine_page;

CREATE UNIQUE INDEX IF NOT EXISTS unique_zine_page_generation
  ON public.zine_pages(zine_id, generation_id, page_number);

CREATE INDEX IF NOT EXISTS idx_zine_pages_active_generation
  ON public.zine_pages(zine_id, generation_id, page_number);

CREATE TABLE IF NOT EXISTS public.zine_processing_jobs (
  id BIGSERIAL PRIMARY KEY,
  zine_id INTEGER NOT NULL UNIQUE REFERENCES public.library_zines(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  lease_until TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zine_processing_jobs_queue
  ON public.zine_processing_jobs(status, next_attempt_at, updated_at);

ALTER TABLE public.zine_processing_jobs ENABLE ROW LEVEL SECURITY;

COMMIT;
