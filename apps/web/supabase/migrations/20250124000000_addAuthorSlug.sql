BEGIN;

-- Add slug column to authors table
ALTER TABLE public.authors ADD COLUMN IF NOT EXISTS slug TEXT;

-- Function to generate slug from name (simplified version of JavaScript slugify)
CREATE OR REPLACE FUNCTION generate_author_slug(name_text TEXT, exclude_id INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  slug_text TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug_text := lower(trim(name_text));
  slug_text := regexp_replace(slug_text, '[^a-z0-9]+', '-', 'g');
  slug_text := regexp_replace(slug_text, '^-+|-+$', '', 'g');
  
  base_slug := slug_text;
  
  -- Ensure uniqueness by appending number if needed
  WHILE EXISTS (
    SELECT 1 FROM public.authors 
    WHERE slug = slug_text 
    AND (exclude_id IS NULL OR id != exclude_id)
  ) LOOP
    counter := counter + 1;
    slug_text := base_slug || '-' || counter;
  END LOOP;
  
  RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing authors
UPDATE public.authors
SET slug = generate_author_slug(name, id)
WHERE slug IS NULL;

-- Make slug NOT NULL and add unique constraint
ALTER TABLE public.authors ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.authors ADD CONSTRAINT unique_authors_slug UNIQUE (slug);

-- Function to auto-generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION set_author_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_author_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE TRIGGER set_author_slug_trigger
BEFORE INSERT OR UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION set_author_slug();

COMMIT;

