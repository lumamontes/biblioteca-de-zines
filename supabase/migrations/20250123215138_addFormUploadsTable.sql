BEGIN;

CREATE TABLE public.form_uploads (
    id SERIAL PRIMARY KEY, 
    title TEXT NOT NULL,
    author_name TEXT,
    author_url TEXT,
    collection_title TEXT,
    cover_image TEXT,
    description TEXT,
    is_published BOOLEAN,
    pdf_url TEXT,
    tags JSONB,
    uuid UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;
