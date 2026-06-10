-- ════════════════════════════════════════════════════════════════════════
-- Migration 0001 — Socle d'isolation : organisations + utilisateurs + RLS
-- ────────────────────────────────────────────────────────────────────────
-- Règles d'or appliquées ici (cf. CLAUDE.md / brief §8) :
--   • Isolation stricte par organisation : RLS sur org_id, partout.
--   • Aucune org ne voit jamais les données d'une autre.
--   • Auth réelle via sessions Supabase (jamais de token statique).
-- Convention : noms de colonnes en anglais, commentaires en français.
-- ════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────
-- 1. Types énumérés
-- ────────────────────────────────────────────────────────────────────────
create type public.user_role as enum ('admin', 'member');
create type public.org_plan  as enum ('trial', 'solo', 'team', 'business');


-- ────────────────────────────────────────────────────────────────────────
-- 2. organizations — le tenant racine. Une ligne = une équipe isolée.
-- ────────────────────────────────────────────────────────────────────────
create table public.organizations (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null check (char_length(name) between 1 and 120),
  plan                      public.org_plan not null default 'trial',
  minutes_quota             integer not null default 300,
  minutes_used_this_period  integer not null default 0,
  retention_days            integer not null default 30,
  created_at                timestamptz not null default now()
);

comment on table public.organizations is
  'Tenant racine. Tout le reste est cloisonné par org_id. retention_days = purge variable selon le plan.';


-- ────────────────────────────────────────────────────────────────────────
-- 3. users — profil applicatif, lié 1:1 à auth.users. Porte l'org_id.
-- ────────────────────────────────────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  org_id        uuid not null references public.organizations (id) on delete cascade,
  email         text not null,
  display_name  text not null default '',
  role          public.user_role not null default 'member',
  created_at    timestamptz not null default now()
);

create index users_org_id_idx on public.users (org_id);

comment on table public.users is
  'Profil applicatif. id = auth.users.id. L''org_id porté ici pilote toute la RLS via current_org_id().';


-- ────────────────────────────────────────────────────────────────────────
-- 4. current_org_id() — PIVOT de l'isolation.
--    SECURITY DEFINER : s'exécute avec les droits du propriétaire (postgres)
--    et contourne donc la RLS de public.users. Indispensable, sinon la policy
--    de users s'appellerait elle-même → récursion infinie.
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.users where id = auth.uid();
$$;

comment on function public.current_org_id() is
  'org_id de l''utilisateur courant (depuis auth.uid()). Pivot de toutes les policies RLS.';

revoke all on function public.current_org_id() from public;
grant execute on function public.current_org_id() to authenticated;


-- ────────────────────────────────────────────────────────────────────────
-- 5. RLS — organizations
--    Lecture : sa propre org. Modification : sa propre org, et seulement admin.
--    Pas d'INSERT/DELETE client : création via le trigger bootstrap uniquement.
-- ────────────────────────────────────────────────────────────────────────
alter table public.organizations enable row level security;

create policy "org_select_own" on public.organizations
  for select
  using (id = public.current_org_id());

create policy "org_update_own_admin" on public.organizations
  for update
  using (
    id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  )
  with check (id = public.current_org_id());


-- ────────────────────────────────────────────────────────────────────────
-- 6. RLS — users
--    Lecture : les membres de sa propre org. Mise à jour : son propre profil.
--    INSERT via le trigger SECURITY DEFINER, jamais par le client.
-- ────────────────────────────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "users_select_same_org" on public.users
  for select
  using (org_id = public.current_org_id());

create policy "users_update_self" on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid() and org_id = public.current_org_id());


-- ────────────────────────────────────────────────────────────────────────
-- 7. Bootstrap à l'inscription — trigger sur auth.users.
--    À chaque nouvel inscrit :
--      • si invite_org_id fourni  → rejoint cette org en 'member' ;
--      • sinon                    → crée une nouvelle org et devient 'admin'.
--    SECURITY DEFINER : écrit dans public.* en contournant la RLS.
--    Fonctionne même quand la confirmation e-mail est active (la ligne
--    auth.users est créée dès le signUp, avant confirmation).
-- ────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id       uuid;
  v_org_name     text := nullif(trim(new.raw_user_meta_data->>'org_name'), '');
  v_display_name text := coalesce(
                           nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
                           split_part(new.email, '@', 1)
                         );
  v_invite_org   uuid := nullif(new.raw_user_meta_data->>'invite_org_id', '')::uuid;
begin
  if v_invite_org is not null then
    insert into public.users (id, org_id, email, display_name, role)
    values (new.id, v_invite_org, new.email, v_display_name, 'member');
  else
    insert into public.organizations (name)
    values (coalesce(v_org_name, v_display_name || ' — équipe'))
    returning id into v_org_id;

    insert into public.users (id, org_id, email, display_name, role)
    values (new.id, v_org_id, new.email, v_display_name, 'admin');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
