-- ════════════════════════════════════════════════════════════════════════
-- Migration 0003 — Table entries (audio + notes) + Storage bucket
-- ────────────────────────────────────────────────────────────────────────
-- Règles d'or (CLAUDE.md / brief §8) :
--   • Isolation stricte par org_id → RLS sur org_id via current_org_id()
--   • Audio uploadé par URL signée, stockage EU
--   • Colonnes en anglais, commentaires en français
-- ════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────
-- 1. Type enum : type d'entrée (audio ou texte)
-- ────────────────────────────────────────────────────────────────────────
create type public.entry_type as enum ('audio', 'text');


-- ────────────────────────────────────────────────────────────────────────
-- 2. entries — une entrée = une note vocale uploadée ou une note écrite
-- ────────────────────────────────────────────────────────────────────────
create table public.entries (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  type             public.entry_type not null,
  storage_path     text,                              -- chemin dans le bucket Supabase (audio uniquement)
  raw_text         text,                              -- texte brut saisi (type='text') ou placeholder
  transcript       text,                              -- transcription IA (rempli par la pipeline, Phase 2)
  extracted_tasks_json jsonb default '[]'::jsonb,     -- tâches extraites (rempli par la pipeline)
  processed_at     timestamptz,                       -- null = pas encore traité par la pipeline
  created_at       timestamptz not null default now()
);

create index entries_org_id_idx    on public.entries (org_id);
create index entries_user_id_idx   on public.entries (user_id);
create index entries_created_at_idx on public.entries (created_at desc);

comment on table public.entries is
  'Entrées vocales ou écrites capturées par les utilisateurs. La pipeline (Phase 2) remplit transcript + extracted_tasks_json.';


-- ────────────────────────────────────────────────────────────────────────
-- 3. RLS — entries
--    Lecture : membres de la même org. Insertion : son propre user_id.
--    Modification : sa propre entrée. Suppression : admin de l'org uniquement.
-- ────────────────────────────────────────────────────────────────────────
alter table public.entries enable row level security;

create policy "entries_select_same_org" on public.entries
  for select
  using (org_id = public.current_org_id());

create policy "entries_insert_own" on public.entries
  for insert
  with check (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

create policy "entries_update_own" on public.entries
  for update
  using (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  )
  with check (
    org_id = public.current_org_id()
    and user_id = auth.uid()
  );

create policy "entries_delete_admin" on public.entries
  for delete
  using (
    org_id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────────────────
-- 4. Storage bucket — audio-uploads (EU, privé, signé)
--    Supabase gère les policies storage via sa propre syntaxe.
--    Le bucket est privé : l'accès se fait par URL signée (server action).
-- ────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audio-uploads',
  'audio-uploads',
  false,                      -- privé : seules les URL signées donnent accès
  52428800,                   -- 50 Mo max par fichier
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
);

-- Policy storage : SELECT (lecture) → membres de la même org que le propriétaire du fichier
-- Le propriétaire est stocké dans owner_id (auth.uid() au moment de l'upload)
create policy "storage_audio_select_same_org"
  on storage.objects
  for select
  using (
    bucket_id = 'audio-uploads'
    and exists (
      select 1 from public.entries e
      where e.storage_path = name
        and e.org_id = public.current_org_id()
    )
  );

-- Policy storage : INSERT (upload) → l'utilisateur authentifié peut uploader dans son org
create policy "storage_audio_insert_auth"
  on storage.objects
  for insert
  with check (
    bucket_id = 'audio-uploads'
    and auth.uid() is not null
  );

-- Policy storage : DELETE → admin de l'org seulement
create policy "storage_audio_delete_admin"
  on storage.objects
  for delete
  using (
    bucket_id = 'audio-uploads'
    and exists (
      select 1 from public.entries e
      where e.storage_path = name
        and e.org_id = public.current_org_id()
        and exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role = 'admin'
        )
    )
  );
