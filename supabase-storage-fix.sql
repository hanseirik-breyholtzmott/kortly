-- Fix storage RLS policies for card images
-- Run this in your Supabase SQL Editor

-- First, let's check if the bucket exists and create it if not
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'card-images',
  true,
  52428800, -- 50MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create new, more permissive policies
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images'
);

CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images'
);

CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images'
);

-- Alternative: If the above doesn't work, try this more permissive approach
-- Uncomment the following lines if you still get RLS errors:

-- DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public access to view images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

-- CREATE POLICY "Allow all authenticated operations on card-images" ON storage.objects
-- FOR ALL USING (
--   auth.role() = 'authenticated' AND
--   bucket_id = 'card-images'
-- );

-- CREATE POLICY "Allow public read access to card-images" ON storage.objects
-- FOR SELECT USING (bucket_id = 'card-images');
 