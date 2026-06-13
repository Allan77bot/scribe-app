-- ════════════════════════════════════════════════════════════════════════
-- Migration 0004 — Rapports quotidiens + accusés de lecture
-- ────────────────────────────────────────────────────────────────────────
-- Règles d'or :
--   • Isolation stricte par org_id → RLS sur org_id
--   • Rapport de passation généré en fin de période
--   • Accusé de lecture par utilisateur
-- ════════════════════════════════════════════════════════════════════════

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  report_date   date not null,
  shift_label   text not null default 'jour',
  html          text not null,
  audio_url     text,
  generated_by  uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index reports_org_id_idx on public.reports (org_id, report_date desc);

comment on table public.reports is
  'Rapports quotidiens de passation (WF2). Un rapport par org et par jour. Le HTML contient le récap : fait, reste à faire, à reprendre.';

-- ── Accusés de lecture ───────────────────────────────────────────────────
create table public.report_reads (
  report_id     uuid not null references public.reports (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  read_at       timestamptz not null default now(),
  primary key (report_id, user_id)
);

comment on table public.report_reads is
  'Accusés de lecture des rapports. Une ligne = un utilisateur a marqué le rapport comme lu.';

-- ── RLS : reports ────────────────────────────────────────────────────────
alter table public.reports enable row level security;

create policy "reports_select_same_org" on public.reports
  for select
  using (org_id = public.current_org_id());

create policy "reports_insert_admin" on public.reports
  for insert
  with check (
    org_id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- ── RLS : report_reads ───────────────────────────────────────────────────
alter table public.report_reads enable row level security;

create policy "reads_select_same_org" on public.report_reads
  for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_reads.report_id
        and r.org_id = public.current_org_id()
    )
  );

create policy "reads_insert_own" on public.report_reads
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.reports r
      where r.id = report_reads.report_id
        and r.org_id = public.current_org_id()
    )
  );
