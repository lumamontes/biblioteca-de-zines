BEGIN;

-- Create zine_pages table
CREATE TABLE public.zine_pages (
    id SERIAL PRIMARY KEY,
    zine_id INTEGER NOT NULL REFERENCES library_zines(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_zine_page UNIQUE (zine_id, page_number)
);

-- Add indexes for better query performance
CREATE INDEX idx_zine_pages_zine_id ON public.zine_pages(zine_id);
CREATE INDEX idx_zine_pages_page_number ON public.zine_pages(zine_id, page_number);

-- Alter library_zines table to add import fields
ALTER TABLE public.library_zines 
ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed'));

-- Add index for import_status queries
CREATE INDEX IF NOT EXISTS idx_library_zines_import_status ON public.library_zines(import_status);

COMMIT;

