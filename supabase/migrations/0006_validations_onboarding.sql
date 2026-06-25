-- ════════════════════════════════════════════════════════════════════════
-- Migration 0006 — Validation humaine des tâches + état d'onboarding
-- ────────────────────────────────────────────────────────────────────────
-- Règles d'or (CLAUDE.md / brief §8) :
--   • Règle n°4 : l'IA PROPOSE, un humain CONFIRME, puis seulement le timer
--     démarre. Cette table matérialise et TRACE cette confirmation (qui a
--     validé quoi, quand) — argument B2B/RGPD : toute action est attribuée.
--   • Règle n°2 : isolation stricte par org_id → RLS via current_org_id().
--   • Colonnes en anglais, commentaires en français.
--
-- NOTE de modèle de données : les tâches extraites vivent en JSONB dans
-- entries.extracted_tasks_json (pas de table tasks → pas de task_id réel).
-- Une tâche est donc identifiée par le couple (entry_id, task_index).
-- task_validations référence ce couple. Les accusés de LECTURE, eux, restent
-- portés par report_reads (migration 0004) : on ne duplique pas.
-- ════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────
-- 1. task_validations — la décision humaine sur une tâche proposée par l'IA.
--    Une ligne = l'état de validation courant d'une tâche (upsert sur la clé
--    métier entry_id + task_index). On conserve qui et quand pour la traçabilité.
-- ────────────────────────────────────────────────────────────────────────
create table public.task_validations (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  entry_id      uuid not null references public.entries (id) on delete cascade,
  task_index    integer not null check (task_index >= 0),
  -- Décision humaine. 'validated' = acceptée (timer/escalade autorisés) ;
  -- 'rejected' = écartée ; 'done' = terminée après validation.
  status        text not null default 'validated'
                  check (status in ('validated', 'rejected', 'done')),
  validated_by  uuid references auth.users (id) on delete set null,
  validated_at  timestamptz not null default now(),
  -- Une seule décision courante par tâche : la re-validation fait un upsert.
  unique (entry_id, task_index)
);

create index task_validations_org_id_idx on public.task_validations (org_id);
create index task_validations_entry_idx on public.task_validations (entry_id);

comment on table public.task_validations is
  'Trace de la validation humaine d''une tâche extraite (règle d''or n°4). Identifie la tâche par (entry_id, task_index) car les tâches vivent en JSONB.';


-- ────────────────────────────────────────────────────────────────────────
-- 2. RLS — task_validations. Tout est cloisonné par org_id (current_org_id()).
--    INSERT/UPDATE : on impose en plus que validated_by = auth.uid() pour que
--    l'attribution ne soit pas falsifiable côté client.
-- ────────────────────────────────────────────────────────────────────────
alter table public.task_validations enable row level security;

create policy "task_validations_select_same_org" on public.task_validations
  for select
  using (org_id = public.current_org_id());

create policy "task_validations_insert_own" on public.task_validations
  for insert
  with check (
    org_id = public.current_org_id()
    and validated_by = auth.uid()
  );

create policy "task_validations_update_same_org" on public.task_validations
  for update
  using (org_id = public.current_org_id())
  with check (
    org_id = public.current_org_id()
    and validated_by = auth.uid()
  );

create policy "task_validations_delete_same_org" on public.task_validations
  for delete
  using (org_id = public.current_org_id());


-- ────────────────────────────────────────────────────────────────────────
-- 3. organizations.onboarding_complete — pilote l'affichage du wizard.
--    false par défaut → un nouvel inscrit voit l'onboarding ; passe à true
--    une fois la boucle d'activation faite (org nommée → 1er vocal).
-- ────────────────────────────────────────────────────────────────────────
alter table public.organizations
  add column onboarding_complete boolean not null default false;

comment on column public.organizations.onboarding_complete is
  'true une fois le wizard d''onboarding terminé. Obéit aux policies existantes de organizations.';


-- ────────────────────────────────────────────────────────────────────────
-- 4. reports.kind — distingue le rapport du soir de la passation 3×8.
--    'report'   = rapport quotidien classique (/dashboard/report).
--    'handover' = passation de relais pour l'équipe suivante (/dashboard/handover).
--    Même table, mêmes policies RLS (déjà cloisonnées par org_id) → on filtre par kind.
-- ────────────────────────────────────────────────────────────────────────
alter table public.reports
  add column kind text not null default 'report'
    check (kind in ('report', 'handover'));

comment on column public.reports.kind is
  'report = synthèse du soir ; handover = rapport de passation pour le shift suivant (3×8).';
