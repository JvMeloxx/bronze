-- Create storage bucket for studio assets
INSERT INTO storage.buckets (id, name, public) VALUES ('studio-assets', 'studio-assets', true);

-- Add card_url column to studios table
ALTER TABLE studios ADD COLUMN IF NOT EXISTS card_url TEXT;

-- Policy to allow public read access to studio-assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'studio-assets' );

-- Policy to allow authenticated users to upload to studio-assets
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'studio-assets' );

-- Policy to allow authenticated users to update their own assets
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'studio-assets' );
