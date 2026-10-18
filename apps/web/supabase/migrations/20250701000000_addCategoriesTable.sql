BEGIN;

-- Create table for categories
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Ensure case-insensitive uniqueness for category names
CREATE UNIQUE INDEX idx_categories_name_lower ON public.categories (lower(name));

-- Seed default categories
INSERT INTO public.categories (name) VALUES
    ('Ilustração'),
    ('LGBTQIA+'),
    ('Quadrinhos'),
    ('Poético'),
    ('Filosofia / Espiritual'),
    ('Crítica social'),
    ('Autobiográfico'),
    ('Ficção científica'),
    ('Fantasia'),
    ('Humor'),
    ('Infantil'),
    ('Infantojuvenil'),
    ('Terror'),
    ('Experimental'),
    ('Arte digital'),
    ('Politico'),
    ('Música'),
    ('Fotografia'),
    ('Educação');

COMMIT; 