-- ════════════════════════════════════════════════════════════════════════
-- Migration 0010 — Avatars (photo) + couleur distinctive par membre
-- ────────────────────────────────────────────────────────────────────────
-- Ajoute deux colonnes au profil applicatif et un bucket Storage pour les
-- photos de profil. Met à jour handle_new_user() pour qu'un nouveau membre
-- reçoive AUTOMATIQUEMENT une couleur encore libre dans son organisation.
--
-- Règles d'or :
--   • Règle n°2 (isolation) : on ne touche QUE public.users (déjà cloisonnée
--     par org_id + RLS depuis 0001). Aucune table neuve → check:rls reste vert.
--   • Le bucket avatars est PUBLIC en lecture (photo affichée partout), mais
--     l'écriture est verrouillée au dossier de l'utilisateur ({uid}/…).
-- Convention : colonnes en anglais, commentaires en français.
-- ════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────
-- 1. Colonnes de profil — photo + couleur (idempotent).
-- ────────────────────────────────────────────────────────────────────────
alter table public.users
  add column if not exists avatar_url text,
  add column if not exists color      varchar(7);

comment on column public.users.avatar_url is
  'URL publique de la photo de profil (bucket avatars). Null = monogramme couleur.';
comment on column public.users.color is
  'Couleur distinctive du membre (#RRGGBB), unique dans l''org. Auto-attribuée à l''inscription.';


-- ────────────────────────────────────────────────────────────────────────
-- 2. Bucket Storage « avatars » — public en lecture, écriture par propriétaire.
--    Chemin imposé : {auth.uid()}/avatar.<ext> → un membre n'écrase que sa photo.
-- ────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,                                                   -- public : lecture libre
  5242880,                                                -- 5 Mo max
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lecture : tout le monde (la photo s'affiche dans l'app comme une URL publique).
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Écriture : un utilisateur authentifié, uniquement dans SON dossier {uid}/.
create policy "avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ────────────────────────────────────────────────────────────────────────
-- 3. handle_new_user() — remplace la version de 0007 pour AUSSI attribuer une
--    couleur libre. La logique d'invitation par jeton signé est conservée
--    telle quelle (règle d'or n°1/n°2). La couleur est la 1re teinte de la
--    palette encore inutilisée dans l'org (repli : 1re teinte si org pleine).
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
      -- WITH ORDINALITY : ordre de la palette garanti (sinon unnest non ordonné).
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
