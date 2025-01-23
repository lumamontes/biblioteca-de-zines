
-- Create the `library_zines` table
CREATE TABLE public.library_zines (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    collection_title TEXT,
    cover_image TEXT,
    pdf_url TEXT,
    tags JSONB,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    uuid UUID DEFAULT gen_random_uuid(),
    CONSTRAINT unique_library_zine_uuid UNIQUE (uuid)
);

ALTER TABLE library_zines ADD CONSTRAINT unique_library_zines_slug UNIQUE (slug);

-- Function to update `updated_at` for `library_zines`
CREATE OR REPLACE FUNCTION update_library_zines_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for `library_zines` to update `updated_at`
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.library_zines
FOR EACH ROW
EXECUTE FUNCTION update_library_zines_updated_at_column();


CREATE TABLE public.authors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE public.library_zines_authors (
    id SERIAL PRIMARY KEY,
    zine_id INT NOT NULL,
    author_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_library_zines FOREIGN KEY (zine_id) REFERENCES public.library_zines (id) ON DELETE CASCADE,
    CONSTRAINT fk_authors FOREIGN KEY (author_id) REFERENCES public.authors (id) ON DELETE CASCADE,
    
    UNIQUE (zine_id, author_id)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;