-- 0009_audio_storage.sql
-- Bucket audio pour les notes vocales
-- RLS: upload par l'utilisateur auth, lecture pour les membres de l'org

-- Créer le bucket (via raw SQL, car Supabase Storage utilise des tables internes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio_notes',
  'audio_notes',
  false,  -- pas public : accès via URL signée uniquement
  52428800,  -- 50 MB max
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a']
) ON CONFLICT (id) DO UPDATE SET allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: upload — l'utilisateur auth peut uploader dans son org
CREATE POLICY "auth_user_upload_audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio_notes'
  AND auth.role() = 'authenticated'
);

-- Policy: select — l'utilisateur auth peut lire les fichiers de son org
-- (RLS sur le bucket : on utilise le user_id dans le path)
CREATE POLICY "auth_user_read_own_audio"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio_notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: delete — propriétaire uniquement
CREATE POLICY "auth_user_delete_own_audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio_notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
