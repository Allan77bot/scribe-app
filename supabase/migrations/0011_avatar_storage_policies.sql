-- Migration 0011: Storage policies for avatars bucket
-- Run via Supabase Dashboard > SQL Editor

-- 1) Ensure avatars bucket exists (skip if already)
-- Done via Dashboard: Storage > New bucket > avatars, Public=true, 5MB limit

-- 2) Create storage policies for avatars
-- These allow authenticated users to read all avatars and write their own.

BEGIN;

-- Remove any existing policies on storage.objects for avatars to avoid conflicts
DO $$ 
DECLARE 
  rec RECORD;
BEGIN 
  FOR rec IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', rec.policyname);
  END LOOP;
END $$;

-- Public read access to avatars
CREATE POLICY "avatars_select_public" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

-- Authenticated users can insert into their own folder
CREATE POLICY "avatars_insert_own" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatars
CREATE POLICY "avatars_update_own" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

-- Users can delete their own avatars
CREATE POLICY "avatars_delete_own" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'avatars' AND owner = auth.uid());

COMMIT;
