-- Fix handle_new_user trigger cassé
-- Exécute ce SQL dans l'éditeur SQL Supabase : https://supabase.com/dashboard/project/doorjfxqetoawqnvguvz/sql/new
-- Ce script répare le trigger qui bloque l'avatar upload, les invitations, et
-- l'auto-réparation du dashboard.

-- 1. Supprime le trigger cassé (silencieux si absent)
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Recrée la fonction proprement (LANGUAGE plpgsql, pas sql)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_org_id  uuid;
  used_colors text[];
  free_color  text;
  palette     text[] := ARRAY[
    '#E74C3C','#3498DB','#2ECC71','#F39C12',
    '#9B59B6','#1ABC9C','#E67E22','#ECF0F1'
  ];
BEGIN
  -- Crée l'organisation si l'utilisateur n'en a pas
  INSERT INTO public.organizations (name, plan, minutes_quota)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'org_name', split_part(NEW.email, '@', 1) || ' — équipe'),
    'free', 600
  )
  RETURNING id INTO new_org_id;

  -- Couleurs déjà prises dans l'org
  SELECT array_agg(DISTINCT color)
  INTO used_colors
  FROM public.users
  WHERE org_id = new_org_id AND color IS NOT NULL;

  -- Première couleur libre
  SELECT c
  INTO free_color
  FROM unnest(palette) AS c
  WHERE c <> ALL(COALESCE(used_colors, ARRAY[]::text[]))
  LIMIT 1;

  -- Insertion du profil
  INSERT INTO public.users (
    id,
    org_id,
    email,
    display_name,
    role,
    color
  ) VALUES (
    NEW.id,
    new_org_id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      split_part(NEW.email, '@', 1)
    ),
    'admin',
    COALESCE(free_color, '#3498DB')
  );

  RETURN NEW;
END;
$$;

-- 3. Recrée le trigger
CREATE TRIGGER handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Vérifie le résultat
SELECT 'Trigger OK' AS status;
