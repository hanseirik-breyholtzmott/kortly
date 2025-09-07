-- =====================================================
-- COMPLETE SUPABASE SETUP FOR CARD UPLOADER
-- =====================================================
-- This file contains everything needed to set up the database and storage
-- Run this in your Supabase SQL editor to get started

-- =====================================================
-- 1. DATABASE TABLES
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  rarity TEXT,
  set_name TEXT,
  card_number TEXT,
  condition TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  is_graded BOOLEAN DEFAULT FALSE,
  grade_company TEXT,
  grade_score TEXT,
  for_sale BOOLEAN DEFAULT FALSE,
  front_image_url TEXT,
  back_image_url TEXT,
  damage_images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_owner_id ON cards(owner_id);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_for_sale ON cards(for_sale);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);

-- =====================================================
-- 2. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cards policies
CREATE POLICY "Users can view all cards" ON cards FOR SELECT USING (true);
CREATE POLICY "Users can insert their own cards" ON cards FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own cards" ON cards FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own cards" ON cards FOR DELETE USING (auth.uid() = owner_id);

-- =====================================================
-- 3. STORAGE SETUP
-- =====================================================

-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'card-images',
  true,
  52428800, -- 50MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for card-images bucket
CREATE POLICY "Users can upload card images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images' AND
  starts_with(name, 'cards/' || auth.uid()::text || '/')
);

CREATE POLICY "Public can view card images" ON storage.objects
FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images' AND
  starts_with(name, 'cards/' || auth.uid()::text || '/')
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'card-images' AND
  starts_with(name, 'cards/' || auth.uid()::text || '/')
);

-- =====================================================
-- 4. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'given_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up orphaned images when cards are deleted
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

-- Function to get storage usage per user
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

-- =====================================================
-- 5. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Uncomment the following lines to add sample data for testing

-- INSERT INTO profiles (id, username, display_name, email) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'testuser', 'Test User', 'test@example.com');

-- INSERT INTO cards (owner_id, name, type, rarity, set_name, card_number, condition, description, quantity, is_graded, grade_company, grade_score, for_sale) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'Charizard', 'Fire', 'Rare Holo', 'Base Set', '4/102', 'Near Mint', 'Classic Charizard card from the original Base Set', 1, true, 'PSA', '9', false);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your Supabase database and storage are now ready for the card uploader app.
-- Make sure to configure your environment variables and test the upload functionality.
