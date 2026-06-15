-- ════════════════════════════════════════════════════════════════════════
-- Migration 0008 — Table tasks (tâches extraites des entrées)
-- ────────────────────────────────────────────────────────────────────────
-- Règle d'or §2 : isolation stricte par org_id, RLS obligatoire
-- Colonnes en anglais, commentaires en français
-- ════════════════════════════════════════════════════════════════════════

-- 1. Type enum : statut d'une tâche
create type public.task_status as enum ('pending', 'in_progress', 'done', 'validated');

-- 2. Table tasks
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  entry_id     uuid references public.entries (id) on delete set null,
  title        text not null,
  description  text,
  status       public.task_status not null default 'pending',
  assigned_to  uuid references auth.users (id) on delete set null,
  priority     smallint not null default 0 check (priority between 0 and 3),
  due_at       timestamptz,
  validated_by uuid references auth.users (id) on delete set null,
  validated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index tasks_org_id_idx    on public.tasks (org_id);
create index tasks_entry_id_idx  on public.tasks (entry_id);
create index tasks_status_idx    on public.tasks (status);
create index tasks_assigned_idx  on public.tasks (assigned_to);
create index tasks_created_idx   on public.tasks (created_at desc);

comment on table public.tasks is
  'Tâches extraites des entrées (audio/texte). L''IA propose, un humain valide.';

-- 3. RLS — tasks
alter table public.tasks enable row level security;

create policy "tasks_select_same_org" on public.tasks
  for select using (org_id = public.current_org_id());

create policy "tasks_insert_same_org" on public.tasks
  for insert with check (org_id = public.current_org_id());

create policy "tasks_update_same_org" on public.tasks
  for update using (org_id = public.current_org_id());

create policy "tasks_delete_admin_only" on public.tasks
  for delete using (
    org_id = public.current_org_id()
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin' and org_id = public.current_org_id()
    )
  );

-- 4. Trigger: updated_at automatique
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
