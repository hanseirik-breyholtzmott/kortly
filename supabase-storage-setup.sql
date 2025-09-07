-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'card-images',
  true,
  52428800, -- 50MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff']
);

-- Storage policies for card-images bucket

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload card images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images' AND
  starts_with(name, 'cards/' || auth.uid()::text || '/')
);

-- Allow public access to view images
CREATE POLICY "Public can view card images" ON storage.objects
FOR SELECT USING (bucket_id = 'card-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images' AND
  starts_with(name, 'cards/' || auth.uid()::text || '/')
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images' AND
  starts_with(name, 'cards/' || auth.uid()::text || '/')
);

-- Optional: Create a function to clean up orphaned images when cards are deleted
CREATE OR REPLACE FUNCTION cleanup_card_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete front image
  IF OLD.front_image_url IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'card-images' 
    AND name = split_part(OLD.front_image_url, 'card-images/', 2);
  END IF;
  
  -- Delete back image
  IF OLD.back_image_url IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'card-images' 
    AND name = split_part(OLD.back_image_url, 'card-images/', 2);
  END IF;
  
  -- Delete damage images
  IF OLD.damage_images IS NOT NULL AND jsonb_array_length(OLD.damage_images) > 0 THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'card-images' 
    AND name = ANY(
      SELECT split_part(value::text, 'card-images/', 2)
      FROM jsonb_array_elements(OLD.damage_images)
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clean up images when cards are deleted
CREATE TRIGGER cleanup_images_on_card_delete
  AFTER DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION cleanup_card_images();

-- Optional: Create a function to get storage usage per user
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id UUID)
RETURNS TABLE(
  total_files BIGINT,
  total_size BIGINT,
  bucket_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_files,
    COALESCE(SUM(metadata->>'size')::BIGINT, 0) as total_size,
    'card-images' as bucket_name
  FROM storage.objects 
  WHERE bucket_id = 'card-images' 
  AND starts_with(name, 'cards/' || user_id::text || '/');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_storage_usage(UUID) TO authenticated;
