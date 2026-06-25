-- ════════════════════════════════════════════════════════════════════════
-- Migration 0012 — Helper pgrest_exec + apply 0006/0007/0010 at once
-- ────────────────────────────────────────────────────────────────────────
-- 1) Crée la fonction pgrest_exec utilisée par /api/admin/migrate
-- 2) Applique task_validations + invitations + avatars/couleurs
-- 3) Idempotent — runnable plusieurs fois sans erreur
-- ════════════════════════════════════════════════════════════════════════

-- ── PART 0: Helper function for executing SQL remotely ──
CREATE OR REPLACE FUNCTION public.pgrest_exec(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant admin access only
REVOKE ALL ON FUNCTION public.pgrest_exec(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pgrest_exec(text) TO service_role;

-- ── PART 1: Migration 0006 — task_validations + onboarding_complete ──

CREATE TABLE IF NOT EXISTS public.task_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid NOT NULL,
  validated_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS public.task_validations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tv_select' AND tablename = 'task_validations') THEN
    CREATE POLICY tv_select ON public.task_validations FOR SELECT TO authenticated
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tv_insert' AND tablename = 'task_validations') THEN
    CREATE POLICY tv_insert ON public.task_validations FOR INSERT TO authenticated
    WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tv_update' AND tablename = 'task_validations') THEN
    CREATE POLICY tv_update ON public.task_validations FOR UPDATE TO authenticated
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
  END IF;
END $$;

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- ── PART 2: Migration 0007 — invitations ──

CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  accepted_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_key ON public.invitations(token);

ALTER TABLE IF EXISTS public.invitations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'inv_select' AND tablename = 'invitations') THEN
    CREATE POLICY inv_select ON public.invitations FOR SELECT TO authenticated
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'inv_insert' AND tablename = 'invitations') THEN
    CREATE POLICY inv_insert ON public.invitations FOR INSERT TO authenticated
    WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'inv_update' AND tablename = 'invitations') THEN
    CREATE POLICY inv_update ON public.invitations FOR UPDATE TO authenticated
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
  END IF;
END $$;

-- ── PART 3: Migration 0010 — avatars + couleurs ──

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS color varchar(7);

-- Bucket avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

  CREATE POLICY "avatars_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

  CREATE POLICY "avatars_insert_own"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');

  CREATE POLICY "avatars_update_own"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars')
    WITH CHECK (bucket_id = 'avatars');

  CREATE POLICY "avatars_delete_own"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'avatars');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage policies: %', SQLERRM;
END $$;

-- ── PART 4: handle_new_user with color + invitation support ──

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id   uuid;
  v_color    text;
  p          text[];
BEGIN
  p := ARRAY['#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22','#ECF0F1'];
  
  SELECT c INTO v_color
  FROM unnest(p) WITH ORDINALITY AS t(c, ord)
  WHERE c NOT IN (SELECT color FROM public.users WHERE color IS NOT NULL)
  ORDER BY t.ord
  LIMIT 1;
  v_color := COALESCE(v_color, '#3498DB');
  
  INSERT INTO public.organizations (name, plan, minutes_quota)
  VALUES (
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'org_name'), ''),
      SPLIT_PART(NEW.email, '@', 1) || ' — équipe'
    ),
    'free', 600
  )
  RETURNING id INTO v_org_id;
  
  INSERT INTO public.users (id, org_id, email, display_name, role, color)
  VALUES (
    NEW.id,
    v_org_id,
    NEW.email,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'display_name'), ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'admin',
    v_color
  );
  
  RETURN NEW;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── PART 5: Verification ──
SELECT '✅ Migration 0012 applied' AS status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
