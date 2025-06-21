ALTER TABLE authors 
ADD COLUMN name_fts tsvector 
GENERATED ALWAYS AS (to_tsvector('portuguese', name)) STORED;

CREATE INDEX authors_name_fts_idx ON authors USING gin(name_fts);
