BEGIN;

ALTER TABLE public.form_uploads
  ADD COLUMN IF NOT EXISTS active_page_generation TEXT,
  ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS processed_pdf_url TEXT;

CREATE TABLE IF NOT EXISTS public.form_upload_pages (
  id SERIAL PRIMARY KEY,
  form_upload_id INTEGER NOT NULL REFERENCES public.form_uploads(id) ON DELETE CASCADE,
  generation_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_form_upload_page_generation UNIQUE (form_upload_id, generation_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_form_upload_pages_generation
  ON public.form_upload_pages(form_upload_id, generation_id, page_number);

ALTER TABLE public.form_upload_pages ENABLE ROW LEVEL SECURITY;

COMMIT;
