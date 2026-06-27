-- ════════════════════════════════════════════════════════════════════════
-- Migration 0015 — Verrouillage des privilèges UPDATE sur public.users
-- ────────────────────────────────────────────────────────────────────────
-- FAILLE AS-01 (audit 2026-06-27) — Élévation de privilège member → admin (RLS).
-- La policy `users_update_self` (0001:111) borne la LIGNE (`id = auth.uid()`) mais PAS
-- les COLONNES : un simple membre pouvait, avec son cookie de session (JWT) + la clé
-- anon publique, faire un `PATCH /rest/v1/users?id=eq.<son_id>` avec `{"role":"admin"}`
-- directement sur l'API PostgREST — sans passer par l'app — et devenir admin de son org
-- (débloque invitations, renommage org, révocations, facturation). Borné à sa propre org
-- (l'isolation tenant tient), mais c'est une escalade de privilège réelle.
--
-- CORRECTIF — privilèges au NIVEAU COLONNE. On retire le droit d'UPDATE de table à
-- `authenticated`, puis on ne ré-accorde QUE les colonnes de profil que l'app modifie
-- réellement en session (recensé dans le code : updateProfile, profil employé onboarding,
-- markOnboardingComplete, upload avatar) → `display_name`, `color`, `avatar_url`,
-- `onboarding_complete`. Les colonnes `role`, `org_id`, `email`, `id` deviennent
-- IMMUABLES via l'API `authenticated`. La policy RLS continue de borner la ligne.
-- `service_role` (trigger bootstrap SECURITY DEFINER, client admin du pipeline) n'est PAS
-- concerné : il contourne ces grants.
--
-- IDEMPOTENT / DÉFENSIF : rejouable sans risque ; ne grant que les colonnes présentes
-- (si 0010/0014 pas encore appliquées). Aucune donnée touchée.
-- À exécuter en prod par Allan (snapshot DB d'abord), comme 0013/0014.
-- Convention : colonnes en anglais, commentaires en français.
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  -- Colonnes de profil que l'app a le droit de modifier en session (et SEULEMENT elles).
  v_allowed text[] := array['display_name', 'color', 'avatar_url', 'onboarding_complete'];
  v_present text;
begin
  -- 1. Retire l'UPDATE au niveau table. Indispensable : un privilège UPDATE de table
  --    autorise TOUTES les colonnes et rendrait le grant colonne ci-dessous sans effet.
  revoke update on public.users from authenticated;

  -- 2. Ne ré-accorde l'UPDATE que sur les colonnes autorisées RÉELLEMENT présentes
  --    (défensif : `color`/`avatar_url` = 0010, `onboarding_complete` = 0014).
  select string_agg(quote_ident(c), ', ')
    into v_present
  from unnest(v_allowed) as c
  where exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = c
  );

  if v_present is not null then
    execute format('grant update (%s) on public.users to authenticated', v_present);
    raise notice 'users: UPDATE restreint aux colonnes profil (%). role/org_id/email immuables via authenticated.', v_present;
  else
    raise notice 'users: aucune colonne profil trouvée (0010/0014 manquantes ?) — grant colonne NON appliqué, UPDATE retiré.';
  end if;
end $$;

-- 3. Vérification (lecture seule) — doit lister exactement display_name, color,
--    avatar_url, onboarding_complete (et RIEN d'autre, surtout pas role) :
--
--   select column_name
--   from information_schema.column_privileges
--   where grantee = 'authenticated'
--     and table_schema = 'public'
--     and table_name = 'users'
--     and privilege_type = 'UPDATE'
--   order by column_name;
