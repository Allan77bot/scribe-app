-- Migration 0011: politiques RLS storage pour le bucket avatars.
-- Permet aux utilisateurs authentifiés d'uploader/écraser leur avatar
-- dans leur propre dossier {uid}/, SANS avoir besoin de la clé service_role
-- (qui est tronquée sur Vercel à cause du bug Hermes JWT > 200 chars).
--
-- Contexte : le bucket `avatars` est déjà public (lecture pour tous).
-- Cette migration ajoute les droits d'écriture par dossier utilisateur.

-- 1) INSERT — un user auth peut créer un fichier dans son propre dossier
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE name = 'avatars_insert_own_folder'
    AND bucket_id = 'avatars'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'avatars_insert_own_folder',
      'avatars',
      'INSERT',
      '(bucket_id = ''avatars''::text) AND (auth.uid()::text = (storage.foldername(name))[1])'
    );
  END IF;
END $$;
COMMIT;

-- 2) UPDATE — un user auth peut écraser son propre avatar
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE name = 'avatars_update_own_folder'
    AND bucket_id = 'avatars'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'avatars_update_own_folder',
      'avatars',
      'UPDATE',
      '(bucket_id = ''avatars''::text) AND (auth.uid()::text = (storage.foldername(name))[1])'
    );
  END IF;
END $$;
COMMIT;

-- 3) DELETE — un user auth peut supprimer son propre avatar
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE name = 'avatars_delete_own_folder'
    AND bucket_id = 'avatars'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, operation, definition)
    VALUES (
      'avatars_delete_own_folder',
      'avatars',
      'DELETE',
      '(bucket_id = ''avatars''::text) AND (auth.uid()::text = (storage.foldername(name))[1])'
    );
  END IF;
END $$;
COMMIT;
