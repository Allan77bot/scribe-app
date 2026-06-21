-- ════════════════════════════════════════════════════════════════════════
-- Migration 0013 — Réconciliation du schema drift (task_validations, reports.kind, trigger)
-- ────────────────────────────────────────────────────────────────────────
-- CONTEXTE. Deux chemins de migration ont divergé en prod :
--   • 0006/0007/0010 = forme attendue par le CODE, et
--   • 0012_fix_all   = forme « rattrapage » INCOMPATIBLE.
-- Cette migration CONVERGE depuis N'IMPORTE QUEL état vers la forme que le code
-- attend réellement, de façon IDEMPOTENTE et DÉFENSIVE (re-jouable sans risque).
--
-- Elle répare 3 choses :
--   1) public.task_validations  → forme 0006 (entry_id + task_index + UNIQUE),
--      car src/lib/tasks/actions.ts upsert onConflict (entry_id, task_index)
--      avec status ∈ (validated|rejected|done) et validated_by = auth.uid().
--   2) public.reports.kind      → colonne + check (report|handover), car
--      src/lib/handover/actions.ts insère kind='handover' et la page filtre dessus.
--   3) public.handle_new_user() → version 0010 (invitation par jeton + couleur),
--      régressée par 0012 (logique d'invitation perdue ; plan='free' INVALIDE pour
--      l'enum org_plan ; 2e trigger en doublon). On restaure la fonction correcte
--      et on garantit UN SEUL trigger.
--
-- SÉCURITÉ. Aucune table neuve hors task_validations (déjà cloisonnée org_id + RLS).
-- On ne DROP task_validations QUE si elle est en forme drift ET VIDE (jamais de
-- perte de données — sinon on s'arrête en erreur explicite).
-- Convention : colonnes en anglais, commentaires en français.
-- ════════════════════════════════════════════════════════════════════════


-- ── PART 1 : task_validations → forme canonique (0006) ──────────────────────
do $$
declare
  v_tbl_exists     boolean;
  v_has_entry_id   boolean;
  v_has_task_index boolean;
  v_rows           bigint;
begin
  select exists(
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'task_validations'
  ) into v_tbl_exists;

  if v_tbl_exists then
    select exists(select 1 from information_schema.columns
      where table_schema='public' and table_name='task_validations' and column_name='entry_id')
      into v_has_entry_id;
    select exists(select 1 from information_schema.columns
      where table_schema='public' and table_name='task_validations' and column_name='task_index')
      into v_has_task_index;

    if v_has_entry_id and v_has_task_index then
      raise notice 'task_validations: forme canonique deja presente — conservee.';
    else
      -- Forme drift (0012 : task_id, sans entry_id/task_index). On ne recrée
      -- QUE si la table est vide (les upserts échouaient → 0 ligne attendue).
      execute 'select count(*) from public.task_validations' into v_rows;
      if v_rows = 0 then
        raise notice 'task_validations: forme drift (0012) + table VIDE -> recreation en forme canonique.';
        drop table public.task_validations cascade;
        v_tbl_exists := false;
      else
        raise exception 'task_validations en forme drift MAIS contient % ligne(s). Migration interrompue pour ne pas perdre de donnees — intervention manuelle requise.', v_rows;
      end if;
    end if;
  end if;

  if not v_tbl_exists then
    create table public.task_validations (
      id            uuid primary key default gen_random_uuid(),
      org_id        uuid not null references public.organizations (id) on delete cascade,
      entry_id      uuid not null references public.entries (id) on delete cascade,
      task_index    integer not null check (task_index >= 0),
      status        text not null default 'validated'
                      check (status in ('validated', 'rejected', 'done')),
      validated_by  uuid references auth.users (id) on delete set null,
      validated_at  timestamptz not null default now(),
      unique (entry_id, task_index)
    );
    create index task_validations_org_id_idx on public.task_validations (org_id);
    create index task_validations_entry_idx  on public.task_validations (entry_id);
    comment on table public.task_validations is
      'Trace de la validation humaine d''une tache extraite (regle d''or n4). Cle metier (entry_id, task_index) car les taches vivent en JSONB.';
  end if;
end $$;

-- Garantit la contrainte UNIQUE (entry_id, task_index) même si la table préexistait
-- en forme canonique sans la contrainte (l'upsert onConflict en dépend).
do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname = 'task_validations' and c.contype = 'u'
      and pg_get_constraintdef(c.oid) ilike '%(entry_id, task_index)%'
  ) then
    alter table public.task_validations
      add constraint task_validations_entry_task_key unique (entry_id, task_index);
    raise notice 'task_validations: contrainte UNIQUE (entry_id, task_index) ajoutee.';
  end if;
end $$;

-- RLS + policies canoniques (idempotent : on droppe toutes les variantes connues puis recree).
alter table public.task_validations enable row level security;

drop policy if exists tv_select on public.task_validations;
drop policy if exists tv_insert on public.task_validations;
drop policy if exists tv_update on public.task_validations;
drop policy if exists "task_validations_select_same_org" on public.task_validations;
drop policy if exists "task_validations_insert_own" on public.task_validations;
drop policy if exists "task_validations_update_same_org" on public.task_validations;
drop policy if exists "task_validations_delete_same_org" on public.task_validations;

create policy "task_validations_select_same_org" on public.task_validations
  for select using (org_id = public.current_org_id());

create policy "task_validations_insert_own" on public.task_validations
  for insert with check (
    org_id = public.current_org_id() and validated_by = auth.uid()
  );

create policy "task_validations_update_same_org" on public.task_validations
  for update using (org_id = public.current_org_id())
  with check (org_id = public.current_org_id() and validated_by = auth.uid());

create policy "task_validations_delete_same_org" on public.task_validations
  for delete using (org_id = public.current_org_id());


-- ── PART 2 : reports.kind → colonne + check (report|handover) ───────────────
alter table public.reports add column if not exists kind text not null default 'report';

do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname = 'reports' and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%kind%'
  ) then
    alter table public.reports
      add constraint reports_kind_check check (kind in ('report', 'handover'));
    raise notice 'reports: contrainte check kind (report|handover) ajoutee.';
  end if;
end $$;


-- ── PART 3 : handle_new_user() = version 0010 (invitation + couleur) ─────────
-- 0012 avait régressé cette fonction (perte de la logique d'invitation ; plan='free'
-- invalide pour l'enum org_plan) et créé un 2e trigger. On restaure et on dédoublonne.
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
  v_token        uuid;
  v_invite       public.invitations%rowtype;
  -- Palette AA partagée avec src/lib/avatar.ts (garder les deux synchronisées).
  v_palette      text[] := array[
                   '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
                   '#9B59B6', '#1ABC9C', '#E67E22', '#ECF0F1'
                 ];
  v_color        text;
begin
  -- Jeton d'invitation éventuel (UUID dans les métadonnées du signUp).
  begin
    v_token := nullif(trim(new.raw_user_meta_data->>'invitation_token'), '')::uuid;
  exception when others then
    v_token := null; -- jeton mal formé → inscription normale
  end;

  -- ── Cas (a) : invitation valide → rejoindre l'org existante en 'member' ──
  if v_token is not null then
    select * into v_invite
    from public.invitations
    where token = v_token
      and status = 'pending'
      and expires_at > now()
      and lower(email) = lower(new.email)
    limit 1;

    if found then
      -- 1re couleur de la palette encore libre dans l'org rejointe.
      select t.p into v_color
      from unnest(v_palette) with ordinality as t(p, ord)
      where t.p not in (
        select color from public.users
        where org_id = v_invite.org_id and color is not null
      )
      order by t.ord
      limit 1;
      v_color := coalesce(v_color, v_palette[1]);

      insert into public.users (id, org_id, email, display_name, role, color)
      values (new.id, v_invite.org_id, new.email, v_display_name, 'member', v_color);

      update public.invitations
        set status = 'accepted', accepted_at = now()
        where id = v_invite.id;

      return new;
    end if;
    -- jeton invalide / expiré / e-mail différent → on retombe sur le cas (b)
  end if;

  -- ── Cas (b) : inscription normale → org neuve, rôle 'admin', 1re couleur ──
  insert into public.organizations (name)
  values (coalesce(left(v_org_name, 120), v_display_name || ' — équipe'))
  returning id into v_org_id;

  insert into public.users (id, org_id, email, display_name, role, color)
  values (new.id, v_org_id, new.email, v_display_name, 'admin', v_palette[1]);

  return new;
end;
$$;

-- UN SEUL trigger sur auth.users. 0001/0007/0010 → 'on_auth_user_created' ;
-- 0012 → 'handle_new_user' (doublon). On droppe les deux et on recrée le canonique.
drop trigger if exists handle_new_user on auth.users;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ── PART 4 : Vérification post-migration (à exécuter et LIRE à la main) ──────
-- Attendu : task_validations a entry_id + task_index, reports.kind existe,
-- un SEUL trigger sur auth.users.
--   select column_name from information_schema.columns
--     where table_schema='public' and table_name='task_validations' order by 1;
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--     where conrelid='public.task_validations'::regclass;
--   select column_name from information_schema.columns
--     where table_schema='public' and table_name='reports' and column_name='kind';
--   select tgname from pg_trigger
--     where tgrelid='auth.users'::regclass and not tgisinternal;
select '✅ Migration 0013 — reconciliation appliquee' as status;
