BEGIN;

CREATE OR REPLACE FUNCTION public.preserve_zine_slug_alias()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO public.zine_slug_aliases (slug, zine_id)
    VALUES (OLD.slug, NEW.id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS preserve_zine_slug_alias ON public.library_zines;

CREATE TRIGGER preserve_zine_slug_alias
BEFORE UPDATE OF slug ON public.library_zines
FOR EACH ROW
EXECUTE FUNCTION public.preserve_zine_slug_alias();

COMMIT;
