BEGIN;

CREATE OR REPLACE FUNCTION public.activate_zine_page_generation(
  p_zine_id INTEGER, p_generation_id TEXT, p_source_url TEXT, p_cover_image TEXT, p_pages JSONB
)
RETURNS TABLE(activated BOOLEAN, cover_image_used BOOLEAN, previous_generation_id TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_zine library_zines%ROWTYPE; use_cover BOOLEAN;
BEGIN
  IF p_pages IS NULL OR jsonb_typeof(p_pages) <> 'array' OR jsonb_array_length(p_pages) = 0
    OR p_generation_id = '' OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_pages) AS page
      WHERE NULLIF(page->>'page_number', '') IS NULL OR NULLIF(page->>'image_url', '') IS NULL
        OR NULLIF(page->>'width', '') IS NULL OR NULLIF(page->>'height', '') IS NULL
        OR (page->>'width')::INTEGER < 1 OR (page->>'height')::INTEGER < 1
    ) OR (SELECT COUNT(DISTINCT (page->>'page_number')::INTEGER) FROM jsonb_array_elements(p_pages) AS page)
      <> jsonb_array_length(p_pages) OR EXISTS (
        SELECT 1 FROM generate_series(1, jsonb_array_length(p_pages)) AS expected(page_number)
        WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_pages) AS page WHERE (page->>'page_number')::INTEGER = expected.page_number)
      ) THEN RAISE EXCEPTION 'Invalid page generation payload';
  END IF;

  SELECT * INTO current_zine FROM library_zines WHERE id = p_zine_id FOR UPDATE;
  IF NOT FOUND OR current_zine.is_published IS NOT TRUE OR current_zine.pdf_url IS DISTINCT FROM p_source_url THEN
    RETURN QUERY SELECT FALSE, FALSE, NULL::TEXT; RETURN;
  END IF;

  use_cover := p_cover_image IS NOT NULL AND (
    current_zine.cover_image IS NULL OR btrim(current_zine.cover_image) = ''
    OR lower(current_zine.cover_image) LIKE '%/zines.png'
    OR lower(current_zine.cover_image) LIKE '%/home-gif.gif'
    OR current_zine.cover_image LIKE '%/zines/' || p_zine_id || '/covers/%'
  );

  INSERT INTO zine_pages (zine_id, generation_id, page_number, image_url, width, height)
  SELECT p_zine_id, p_generation_id, (page->>'page_number')::INTEGER, page->>'image_url',
    (page->>'width')::INTEGER, (page->>'height')::INTEGER FROM jsonb_array_elements(p_pages) AS page;
  UPDATE library_zines SET active_page_generation = p_generation_id,
    cover_image = CASE WHEN use_cover THEN p_cover_image ELSE current_zine.cover_image END,
    import_status = 'completed', processed_pdf_url = p_source_url, total_pages = jsonb_array_length(p_pages)
    WHERE id = p_zine_id;
  DELETE FROM zine_pages WHERE zine_id = p_zine_id AND generation_id <> p_generation_id;
  RETURN QUERY SELECT TRUE, use_cover, current_zine.active_page_generation;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_zine_page_generation(INTEGER, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_zine_page_generation(INTEGER, TEXT, TEXT, TEXT, JSONB) TO service_role;

COMMIT;
