-- ════════════════════════════════════════════════════════════════════════
-- Migration 0014 — Onboarding par-personne (users.onboarding_complete)
-- ────────────────────────────────────────────────────────────────────────
-- CONTEXTE. Le drapeau d'onboarding vivait sur organizations.onboarding_complete
-- (0006), donc PAR ÉQUIPE. Un employé qui rejoignait une org déjà onboardée était
-- renvoyé direct au dashboard → le parcours employé ne se déclenchait jamais.
-- On déplace le drapeau au NIVEAU UTILISATEUR : chaque personne fait son propre
-- onboarding (le manager voit l'intro manager, l'employé invité voit la sienne).
--
-- SÉCURITÉ. On ne touche QUE public.users (déjà cloisonnée par org_id + RLS
-- depuis 0001 ; la policy users_update_self autorise déjà un membre à modifier
-- son propre profil). AUCUNE table neuve → check:rls reste vert par construction.
-- Idempotent et défensif (re-jouable sans risque). À appliquer APRÈS 0013.
-- Convention : colonnes en anglais, commentaires en français.
-- ════════════════════════════════════════════════════════════════════════


-- ── 1. Colonne onboarding_complete sur public.users (idempotent) ────────────
alter table public.users
  add column if not exists onboarding_complete boolean not null default false;

comment on column public.users.onboarding_complete is
  'true une fois le wizard d''onboarding terminé par CE membre. Pilote la redirection vers /onboarding. Par-personne (et non par org) depuis 0014.';


-- ── 2. Reprise : le MANAGER d'une org déjà onboardée ne revoit pas l'intro ──
--    Si organizations.onboarding_complete existe (0006 appliquée), on bascule à
--    true les seuls ADMINS dont l'org était déjà marquée onboardée (le manager
--    existant ne revoit pas son wizard). On laisse VOLONTAIREMENT les members
--    existants à false : un employé qui avait rejoint une org déjà onboardée
--    (le bug même qu'on corrige) n'avait jamais vu son parcours → il le verra à
--    sa prochaine visite. Bloc DÉFENSIF : si la colonne org est absente, on capte
--    EXCEPTION undefined_column et on ne fait rien (pas d'erreur, pas de blocage).
do $$
begin
  update public.users u
    set onboarding_complete = true
    from public.organizations o
    where u.org_id = o.id
      and o.onboarding_complete = true
      and u.onboarding_complete = false
      and u.role = 'admin';
exception
  when undefined_column then
    null; -- organizations.onboarding_complete absente → rien à reprendre
end $$;


-- ── 3. Vérification post-migration (à exécuter et LIRE à la main) ───────────
--   select column_name, data_type, column_default from information_schema.columns
--     where table_schema='public' and table_name='users' and column_name='onboarding_complete';
select '✅ Migration 0014 — onboarding par-personne (users.onboarding_complete)' as status;
