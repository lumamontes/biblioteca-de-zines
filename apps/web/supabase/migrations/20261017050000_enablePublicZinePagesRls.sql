BEGIN;

ALTER TABLE public.zine_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published zine pages"
  ON public.zine_pages;

CREATE POLICY "Public can read published zine pages"
  ON public.zine_pages
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.library_zines
      WHERE library_zines.id = zine_pages.zine_id
        AND library_zines.is_published IS TRUE
    )
  );

COMMIT;
