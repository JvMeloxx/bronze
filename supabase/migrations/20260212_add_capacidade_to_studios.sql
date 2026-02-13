
-- Add capacity columns to studios table
ALTER TABLE studios
ADD COLUMN IF NOT EXISTS capacidade_natural INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS capacidade_artificial INTEGER DEFAULT 5;
