-- Add latitude and longitude columns to studios table
ALTER TABLE studios
ADD COLUMN latitude FLOAT,
ADD COLUMN longitude FLOAT;

-- Comment on columns for clarity
COMMENT ON COLUMN studios.latitude IS 'Latitude do estúdio para previsão do tempo';
COMMENT ON COLUMN studios.longitude IS 'Longitude do estúdio para previsão do tempo';
