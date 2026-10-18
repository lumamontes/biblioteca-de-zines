BEGIN;

CREATE OR REPLACE FUNCTION public.preserve_zine_slug_alias()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.zine_slug_aliases
    WHERE slug = NEW.slug
      AND zine_id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Slug is already reserved as an alias: %', NEW.slug
      USING ERRCODE = '23505';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    IF EXISTS (
      SELECT 1
      FROM public.zine_slug_aliases
      WHERE slug = OLD.slug
        AND zine_id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'Previous slug is already owned by another zine: %', OLD.slug
        USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.zine_slug_aliases (slug, zine_id)
    VALUES (OLD.slug, NEW.id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS preserve_zine_slug_alias ON public.library_zines;

CREATE TRIGGER preserve_zine_slug_alias
BEFORE INSERT OR UPDATE OF slug ON public.library_zines
FOR EACH ROW
EXECUTE FUNCTION public.preserve_zine_slug_alias();

COMMIT;
