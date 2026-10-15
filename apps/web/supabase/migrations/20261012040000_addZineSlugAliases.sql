BEGIN;

CREATE TABLE IF NOT EXISTS public.zine_slug_aliases (
  slug TEXT PRIMARY KEY,
  zine_id INTEGER NOT NULL REFERENCES public.library_zines(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zine_slug_aliases_zine_id ON public.zine_slug_aliases(zine_id);
COMMIT;
