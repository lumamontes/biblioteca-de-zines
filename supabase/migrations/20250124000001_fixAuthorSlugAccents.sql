BEGIN;

-- Function to remove accents from text (handles common Portuguese/Brazilian characters)
CREATE OR REPLACE FUNCTION remove_accents(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Replace accented characters with their non-accented equivalents
  text_input := translate(text_input, 
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
  );
  RETURN text_input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Updated function to generate slug from name with proper accent handling
CREATE OR REPLACE FUNCTION generate_author_slug(name_text TEXT, exclude_id INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  slug_text TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Remove accents first
  slug_text := remove_accents(name_text);
  
  -- Convert to lowercase and trim
  slug_text := lower(trim(slug_text));
  
  -- Replace spaces and special chars with hyphens (but keep letters and numbers)
  slug_text := regexp_replace(slug_text, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  slug_text := regexp_replace(slug_text, '^-+|-+$', '', 'g');
  
  -- Ensure we have at least something
  IF slug_text = '' THEN
    slug_text := 'author';
  END IF;
  
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

-- Set all existing slugs to NULL to regenerate them
UPDATE public.authors
SET slug = NULL;

-- Regenerate all slugs with the new function
UPDATE public.authors
SET slug = generate_author_slug(name, id)
WHERE slug IS NULL;

COMMIT;

