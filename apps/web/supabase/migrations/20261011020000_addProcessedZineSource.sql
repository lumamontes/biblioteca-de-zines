BEGIN;

ALTER TABLE public.library_zines
  ADD COLUMN IF NOT EXISTS processed_pdf_url TEXT;

COMMIT;
