-- ════════════════════════════════════════════════════════════════════════
-- Migration 0005 — Stripe billing + usage quotas
-- ────────────────────────────────────────────────────────────────────────
-- organisations.minutes_quota / minutes_used_this_period déjà existants
-- depuis 0001_init_auth.sql.
-- ════════════════════════════════════════════════════════════════════════

-- ── Stripe customer link ──────────────────────────────────────────────────
alter table public.organizations
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text not null default 'trial'
    check (subscription_status in ('trial', 'active', 'past_due', 'canceled', 'unpaid'));

comment on column public.organizations.stripe_customer_id is
  'ID client Stripe lié à l''organisation. Null = jamais passé par Stripe.';

comment on column public.organizations.stripe_subscription_id is
  'ID abonnement Stripe actif. Null = trial ou annulé.';

comment on column public.organizations.subscription_status is
  'Statut de l''abonnement Stripe. trial = période d''essai (plan par défaut).';

-- ── Index ─────────────────────────────────────────────────────────────────
create index orgs_stripe_customer_idx
  on public.organizations (stripe_customer_id)
  where stripe_customer_id is not null;

-- ── RLS déjà en place sur organizations (org_select_own, org_update_own_admin)
--    Rien à ajouter : stripe_customer_id obéit aux mêmes policies.
