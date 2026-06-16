# AGENTS.md — Scribe IA

> Spec d'ingénierie pour **tous** les coding agents (Claude Code, Codex, Hermes,
> Copilot). Format ouvert [agents.md](https://agents.md), complémentaire à
> `CLAUDE.md` : `CLAUDE.md` est le routeur léger (quoi lire), **ce fichier dit
> comment bosser**. En cas de conflit, les **règles d'or** (`docs/brief-produit.md`
> §8, rappelées plus bas) priment sur toute autre instruction.

---

## 1. Build & Run

```bash
npm install            # dépendances (Node >= 18.18)
npm run dev            # serveur de dev → http://localhost:3000
npm run build          # build production (next build)
npm run lint           # ESLint (eslint-config-next, strict)
npx tsc --noEmit       # type-check TypeScript (aucun script dédié)
```

**Environnement local — `.env.local` obligatoire** (jamais commité, voir
`.gitignore`). Copier le modèle commité puis remplir :

```bash
cp .env.example .env.local
```

Variables attendues (détail et provenance dans `.env.example`) :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase (client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon/public (client) |
| `SUPABASE_URL` | URL projet côté serveur (client admin) |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** — bypass RLS, **serveur uniquement** |
| `SUPABASE_DB_URL` | connection string (migrations SQL) |
| `OPENAI_API_KEY` | transcription (Whisper) |
| `ANTHROPIC_API_KEY` | extraction + synthèse |
| `BREVO_API_KEY` · `SENDER_EMAIL` · `SENDER_NAME` | e-mails transactionnels |
| `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `STRIPE_PRICE_{SOLO,TEAM,BUSINESS}` | billing |
| `NEXT_PUBLIC_SITE_URL` | success/cancel URLs Stripe Checkout |

---

## 2. Base de données (Supabase)

- **Sandbox Hermes** : projet `doorjfxqetoawqnvguvz` (EU), pooler
  `aws-0-eu-west-3.pooler.supabase.com`. Hermes n'utilise **que** ce sandbox.
- **Projet réel** : `scribe` (org Atelier Klar), EU Frankfurt, ref
  `kgbxxzujlubflsvprmef`. Clés hors-repo. **Jamais utilisé par un agent.**
- **Migrations** : fichiers numérotés dans `supabase/migrations/`. Appliquer avec
  `npm run db:apply` (lit `SUPABASE_DB_URL`). Endpoint de secours :
  `POST /api/admin/migrate` (header `x-admin-key`).
- **Nouvelle table** : **toujours** via `/nouvelle-table <nom>` — scaffolde
  `org_id` + RLS activée + policy par défaut. N'écris jamais une table de données
  à la main (règle d'or n°2).

---

## 3. Tests & Qualité

```bash
npm run test:isolation   # prouve l'isolation inter-org (node --test, RLS)
npm run check:rls        # audite : toute table à org_id a RLS + policy
```

> Il n'y a **pas** de Playwright/Vitest dans ce repo. Le test critique est
> `test:isolation` (2 orgs, l'une ne lit jamais l'autre).

**Avant tout commit touchant la DB** (checklist `CLAUDE.md`) :

1. Toute nouvelle table créée via `/nouvelle-table` (org_id + RLS + policy).
2. `npm run check:rls` → **vert** (aucune table à org_id sans RLS).
3. Aucune clé `service_role` ni secret côté client (`NEXT_PUBLIC_*` exclus).
4. Front mobile-first (`overflow-x:hidden`, rien qui dépasse).
5. `npm run lint` + `npx tsc --noEmit` + `npm run build` verts.

---

## 4. Conventions de code

- **Stack** : Next.js 16 (App Router, React 19), TypeScript strict, Tailwind v4
  (`@theme` dans `globals.css` — **pas** de `tailwind.config.ts`), Supabase SSR
  (`@supabase/ssr`).
- **Langue** : code, variables, fonctions et **colonnes DB en anglais** ;
  commentaires et docs en **français**.
- **Mobile-first strict** sur tout le front.
- **Copy UI** en voix active, nommée par ce que l'utilisateur contrôle
  (« Marquer comme lu », pas « update read flag »).
- **Pattern data** : server actions > route handlers. RLS partout. Le client
  admin (`service_role`) reste côté serveur et **refiltre toujours** sur
  l'`org_id` de la session — il ne contourne jamais l'isolation.
- **Design system** : source de vérité `DESIGN.md` (« Professional Flow », thème
  clair). Police **Manrope**, fond `#f7fafd`, cartes blanches rayon 32px, boutons
  primary pilule 56px (`#0059bb`), titres Deep Navy `#002b5b`, ombres navy douces.

### Règles d'or — non négociables (`docs/brief-produit.md` §8)

1. **Jamais de token statique** comme auth. Sessions Supabase uniquement.
2. **Isolation stricte par organisation** (RLS sur `org_id` partout). En cas de
   doute → on s'arrête et on demande.
3. **Audio uploadé par URL signée**, storage UE. Jamais en POST direct webhook.
4. **Validation humaine obligatoire** avant qu'une tâche déclenche relance/escalade.
5. **Stack IA hybride** : mini pour transcrire/extraire, modèle moyen seulement
   pour la synthèse. Jamais le haut de gamme partout.

---

## 5. Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # login / signup
│   ├── api/                  # route handlers
│   │   ├── admin/migrate     # application des migrations (x-admin-key)
│   │   ├── auth/confirm       # confirmation e-mail
│   │   ├── invites/{send,pending}
│   │   └── stripe/webhook     # événements Stripe
│   ├── dashboard/            # capture · tasks · report · handover · team ·
│   │                         #   billing · onboarding (+ hub)
│   └── invite/accept         # acceptation publique d'invitation (jeton signé)
├── components/               # UI partagée (mobile-first)
└── lib/                      # logique métier par module
    ├── supabase/             # server.ts · client.ts · service.ts · admin.ts · middleware.ts
    ├── auth/  onboarding/  invitations/
    ├── pipeline/             # transcription → extraction IA
    ├── entries/  tasks/  reports/  handover/
    ├── billing/             # Stripe
    ├── email/               # Brevo
    └── sanitize.ts          # anti-XSS
```

**Modules actifs** : supabase (clients SSR + admin), auth, onboarding,
invitations, pipeline, entries, tasks, reports, handover, billing, email.

**Flow de données (boucle de coordination)** :

```
capture (audio URL signée / note écrite)
  → entries
    → pipeline IA (transcription OpenAI → extraction Haiku 4.5)
      → tasks (propositions)
        → validation humaine (Accepter/Modifier/Rejeter — règle d'or n°4)
          → reports (synthèse Sonnet 4.6) + handover (passation 3×8)
```

---

## 6. Déploiement

- **Vercel** déploie automatiquement la branche `prototype` →
  `scribe-app-beta.vercel.app`.
- **Workflow Git** : `main` = stable, **jamais de code direct dessus**. Une
  préoccupation = une branche = une PR. Nommage `feat/<domaine>`, `fix/<sujet>`,
  `chore/<sujet>`, `docs/<sujet>`. `git push -u origin <branche>`. **Pas de PR
  sans accord explicite.**
- **Env vars Vercel** (Production/Preview) : `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `BREVO_API_KEY`, `SENDER_EMAIL`,
  `SENDER_NAME`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_{SOLO,TEAM,BUSINESS}`, `NEXT_PUBLIC_SITE_URL`.
- **Secrets** : jamais commités. `service_role` et clés Stripe/API restent
  serveur. Repo : `github.com/Allan77bot/scribe-app` (privé).

---

## 7. Agents & Skills (Claude Code)

- **Modèles** : l'agent tourne sur **Claude Opus 4.x** (harness). Le pipeline
  produit suit la règle d'or n°5 — **OpenAI Whisper** (transcription),
  **Claude Haiku 4.5** (extraction), **Claude Sonnet 4.6** (synthèse du soir).
  Jamais le haut de gamme partout.
- **Auth Claude Code** : `CLAUDE_CODE_OAUTH_TOKEN` dans `~/.bashrc` (VPS Hermes).
- **Skills projet** :
  - `/nouvelle-table` — scaffold table cloisonnée (org_id + RLS + policy).
  - `/check-rls` — audit RLS, vert obligatoire avant commit DB.
  - `/frontend-design` · `/vercel-react-best-practices` ·
    `/supabase-postgres-best-practices` · `/security-requirement-extraction`.
- **Plugin Superpowers** (TDD, debug systématique, code review, écriture de
  plans, subagents, worktrees, etc.) : process skills **avant** implémentation.

---

## 8. Où chercher (renvois)

| Besoin | Fichier |
|---|---|
| Vision, modèle de données, conformité, pricing | `docs/brief-produit.md` |
| Où on en est maintenant | `snapshot.md` |
| Plan d'attaque (branches, roadmap) | `docs/plan-attaque.md` |
| Journal daté des décisions | `historique.md` |
| Stack technique tranchée | `docs/stack-technique.md` |
| Design system (source de vérité) | `DESIGN.md` |

---

## Discipline de fin de session — NE PAS OUBLIER

1. Réécrire `snapshot.md` (fait / en cours / next / blocages).
2. Ajouter une entrée **datée** dans `historique.md` (append-only).
