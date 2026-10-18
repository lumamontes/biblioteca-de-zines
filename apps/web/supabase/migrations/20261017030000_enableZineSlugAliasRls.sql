BEGIN;

ALTER TABLE public.zine_slug_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read zine slug aliases"
  ON public.zine_slug_aliases
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMIT;
