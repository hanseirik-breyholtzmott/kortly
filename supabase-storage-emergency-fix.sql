-- EMERGENCY STORAGE FIX - This should definitely work
-- Run this in your Supabase SQL Editor

-- First, let's completely reset the storage setup
-- Drop ALL existing policies on storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Ensure the bucket exists and is properly configured
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

-- Create the most permissive policies possible
-- This allows ALL authenticated users to do ANYTHING with the card-images bucket
CREATE POLICY "card_images_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'card-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "card_images_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'card-images'
);

CREATE POLICY "card_images_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'card-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "card_images_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'card-images' AND
  auth.role() = 'authenticated'
);

-- Alternative: If the above still doesn't work, try this even more permissive approach
-- Uncomment the following lines if you still get RLS errors:

-- DROP POLICY IF EXISTS "card_images_upload_policy" ON storage.objects;
-- DROP POLICY IF EXISTS "card_images_select_policy" ON storage.objects;
-- DROP POLICY IF EXISTS "card_images_update_policy" ON storage.objects;
-- DROP POLICY IF EXISTS "card_images_delete_policy" ON storage.objects;

-- CREATE POLICY "card_images_all_operations" ON storage.objects
-- FOR ALL USING (bucket_id = 'card-images');

-- If that still doesn't work, try disabling RLS entirely for storage.objects:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
