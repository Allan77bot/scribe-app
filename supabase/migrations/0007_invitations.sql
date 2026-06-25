-- ════════════════════════════════════════════════════════════════════════
-- Migration 0007 — Invitations d'équipe par jeton signé
-- ────────────────────────────────────────────────────────────────────────
-- Règles d'or appliquées ici (cf. CLAUDE.md / brief §8) :
--   • Règle n°2 : isolation stricte par organisation → RLS sur org_id partout,
--     pivot public.current_org_id(). Une org ne voit JAMAIS les invitations
--     d'une autre.
--   • Règle n°1 : on ne rejoint JAMAIS une org via un org_id brut fourni par le
--     client. Le rattachement se fait par un JETON secret (UUID v4) envoyé par
--     e-mail à une adresse précise. Posséder le jeton ET contrôler l'adresse
--     autorise à rejoindre CETTE org — rien d'autre.
-- Convention : noms de colonnes en anglais, commentaires en français.
-- ════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────
-- 1. invitations — une invitation en attente d'acceptation.
--    Le jeton est le secret : il vit dans l'URL d'acceptation (/invite/accept)
--    et dans l'e-mail Brevo. expires_at borne sa validité (72 h).
-- ────────────────────────────────────────────────────────────────────────
create table public.invitations (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  -- Adresse invitée. Verrouillée à l'acceptation : l'inscrit ne peut pas la changer.
  email        text not null check (char_length(email) between 3 and 254),
  -- Jeton secret (UUID v4) — unique, sert de clé d'acceptation. Jamais d'org_id en URL.
  token        uuid not null default gen_random_uuid(),
  -- Admin émetteur. set null si le compte émetteur disparaît (l'invitation survit).
  created_by   uuid references auth.users (id) on delete set null,
  -- 'pending' = en attente ; 'accepted' = honorée ; 'revoked' = annulée par un admin.
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'revoked')),
  expires_at   timestamptz not null default (now() + interval '72 hours'),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (token)
);

create index invitations_org_id_idx on public.invitations (org_id);
create index invitations_org_email_idx on public.invitations (org_id, lower(email));

comment on table public.invitations is
  'Invitations d''équipe par jeton signé (UUID v4 + e-mail + expiration 72 h). Rejoindre une org se fait par ce jeton, JAMAIS par un org_id brut (règle d''or n°1/n°2).';


-- ────────────────────────────────────────────────────────────────────────
-- 2. RLS — invitations. Tout est cloisonné par org_id (current_org_id()).
--    Émission / gestion réservées aux ADMINS de l'org. La LECTURE par jeton à
--    l'acceptation (invité pas encore membre → current_org_id() = null) se fait
--    côté serveur via le client service_role, hors RLS — donc pas de policy
--    publique « select by token » (sinon n'importe qui énumérerait les e-mails).
-- ────────────────────────────────────────────────────────────────────────
alter table public.invitations enable row level security;

-- Lecture : les membres de l'org voient ses invitations (l'UI ne les expose qu'aux admins).
create policy "invitations_select_same_org" on public.invitations
  for select
  using (org_id = public.current_org_id());

-- Émission : un ADMIN de l'org, et l'émetteur ne peut pas se faire passer pour un autre.
create policy "invitations_insert_admin" on public.invitations
  for insert
  with check (
    org_id = public.current_org_id()
    and created_by = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Mise à jour (révoquer) : ADMIN de l'org uniquement.
create policy "invitations_update_admin" on public.invitations
  for update
  using (
    org_id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  )
  with check (org_id = public.current_org_id());

-- Suppression : ADMIN de l'org uniquement.
create policy "invitations_delete_admin" on public.invitations
  for delete
  using (
    org_id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────────────────
-- 3. handle_new_user() — remplace la version de 0001 pour gérer DEUX cas :
--    (a) inscription sur invitation → rattachement à l'org du jeton, rôle 'member' ;
--    (b) inscription normale → création d'une org neuve, rôle 'admin'.
--
--    SÉCURITÉ (règle d'or n°2) : on n'honore JAMAIS un org_id brut. On relit
--    l'org depuis public.invitations en vérifiant que le jeton est 'pending',
--    non expiré, ET que l'e-mail de l'invitation correspond à celui de l'inscrit.
--    Un jeton absent / mal formé / invalide → on retombe sur l'inscription normale.
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
      insert into public.users (id, org_id, email, display_name, role)
      values (new.id, v_invite.org_id, new.email, v_display_name, 'member');

      update public.invitations
        set status = 'accepted', accepted_at = now()
        where id = v_invite.id;

      return new;
    end if;
    -- jeton invalide / expiré / e-mail différent → on retombe sur le cas (b)
  end if;

  -- ── Cas (b) : inscription normale → org neuve, rôle 'admin' ──
  insert into public.organizations (name)
  values (coalesce(left(v_org_name, 120), v_display_name || ' — équipe'))
  returning id into v_org_id;

  insert into public.users (id, org_id, email, display_name, role)
  values (new.id, v_org_id, new.email, v_display_name, 'admin');

  return new;
end;
$$;
