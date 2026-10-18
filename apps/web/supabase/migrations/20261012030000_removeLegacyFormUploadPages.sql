BEGIN;

DROP TABLE IF EXISTS public.form_upload_pages;

ALTER TABLE public.form_uploads
  DROP COLUMN IF EXISTS active_page_generation,
  DROP COLUMN IF EXISTS total_pages,
  DROP COLUMN IF EXISTS processing_status,
  DROP COLUMN IF EXISTS processed_pdf_url;

COMMIT;
