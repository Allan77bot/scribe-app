-- ════════════════════════════════════════════════════════════════════════
-- Migration 0016 — Borne défensive de public.users.display_name (faille AS-13)
-- ────────────────────────────────────────────────────────────────────────
-- FAILLE AS-13 (audit 2026-06-27) — display_name n'était borné que côté application.
-- Le correctif applicatif (cleanLine dans signup) couvre le parcours normal, mais un
-- signUp direct via l'API anon (raw_user_meta_data.display_name arbitraire) ou un PATCH
-- direct restaient non bornés au niveau base.
--
-- CORRECTIF — un petit trigger BEFORE INSERT/UPDATE dédié, INDÉPENDANT du gros
-- handle_new_user (qu'on ne touche pas, pour éviter tout risque de drift) : il retire les
-- caractères de contrôle et tronque à 80. S'applique à TOUS les chemins d'écriture
-- (bootstrap, onboarding, updateProfile, PATCH direct).
--
-- IDEMPOTENT : create or replace + drop/create trigger. Aucune donnée existante modifiée
-- (le trigger n'agit qu'aux écritures futures). Convention : colonnes EN, commentaires FR.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.clamp_user_display_name()
returns trigger
language plpgsql
as $$
begin
  if new.display_name is not null then
    -- Retire les caractères de contrôle (dont retours-ligne → anti-injection CRLF),
    -- compacte les espaces, puis tronque à 80 caractères.
    new.display_name := left(
      btrim(regexp_replace(new.display_name, '[[:cntrl:]]+', ' ', 'g')),
      80
    );
  end if;
  return new;
end;
$$;

drop trigger if exists clamp_user_display_name on public.users;
create trigger clamp_user_display_name
  before insert or update on public.users
  for each row
  execute function public.clamp_user_display_name();

-- Vérification (lecture seule) — le trigger doit exister :
--   select tgname from pg_trigger where tgrelid = 'public.users'::regclass
--     and not tgisinternal;
