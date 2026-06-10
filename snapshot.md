# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

**Dernière mise à jour :** 2026-06-10
**Phase :** 1 — `feat/auth` **codé et vérifié en local**, en attente des clés
Supabase pour appliquer les migrations et lancer le test d'isolation.
**Branche active :** `feat/auth` (repo git initialisé localement ce jour)

---

## TL;DR (pour Discord)

Le **socle d'isolation est codé** sur `feat/auth` : Next.js 16 (App Router,
Tailwind, PWA mobile-first) + auth par sessions Supabase + migration SQL
(`organizations` + `users` + `current_org_id()` + **RLS/policies `org_id`** +
trigger qui crée l'org à l'inscription). Flux complet inscription → login →
dashboard → logout. Garde-fous règle d'or n°2 : commandes `/nouvelle-table` et
`/check-rls`. **Build OK, lint OK, pages rendues.** Il **reste une seule chose**
pour valider : qu'Allan colle les clés Supabase EU dans `.env.local`, puis
`npm run db:apply` + `npm run test:isolation`. Pas encore poussé (pas de PR
sans accord).

---

## Fait

- [x] **Fondation doc** (sessions précédentes) : index/snapshot/historique/brief,
      analyse legacy, stack tranchée.
- [x] **Repo git** initialisé (le dossier n'était pas versionné). `main` = doc,
      dev sur `feat/auth`.
- [x] **Squelette Next.js 16** : App Router, TS, Tailwind v4, `src/`, PWA (manifest
      + icônes `legacy/`), mobile-first strict.
- [x] **Migration 0001** : `organizations` + `users` (colonnes EN), enums,
      `current_org_id()` SECURITY DEFINER, trigger bootstrap, **RLS + policies `org_id`**.
- [x] **Auth Supabase** (`@supabase/ssr`) : clients browser/server + `proxy.ts`
      (refresh session + protection `/dashboard`). Aucun token statique, aucune
      `service_role` côté client.
- [x] **Flux** landing → inscription (crée l'équipe, rôle admin) → login →
      dashboard (plan/quota/rétention/rôle) → logout.
- [x] **Garde-fous RLS** : `/nouvelle-table`, `/check-rls`, `npm run check:rls`,
      checklist pré-commit dans `CLAUDE.md`.
- [x] **Test d'isolation** écrit (`npm run test:isolation`, 4 cas dont un anti-injection)
      + script d'application des migrations (`npm run db:apply`, connexion Postgres directe).
- [x] **Audit de sécurité adversarial** (multi-agents) passé et corrigé : 12 trouvailles
      confirmées, dont **1 critique d'isolation** (`invite_org_id` retiré du trigger).
      Build/lint verts. Détail → `historique.md`.

## En cours / bloqué

- **Bloqué sur les accès Supabase EU.** Tout le code est prêt ; il manque
  uniquement le projet + les clés pour appliquer le SQL et prouver l'isolation.

## Prochaines étapes (par ordre)

1. **Allan** remplit `.env.local` (modèle dans `.env.example`) avec les clés du
   projet Supabase **région EU** : `NEXT_PUBLIC_SUPABASE_URL`, anon, `service_role`,
   `SUPABASE_DB_URL` (Settings → Database → Connection string).
2. `npm run db:apply` → applique la migration 0001 sur la base.
3. `npm run test:isolation` → doit être **vert** (org A ne lit rien d'org B).
   C'est le critère de mise en prod (brief §8).
4. PR croisée `feat/auth` : **Alphime valide le schéma** (prérequis #2) → merge.
5. Ensuite : `feat/capture` (audio par URL signée) — front peut démarrer contre
   le contrat de données déjà figé ici.

## Comment lancer (mémo équipe)

- `npm install` puis `npm run dev` → http://localhost:3000 (UI publique visible
  même sans clés grâce au garde-fou du proxy).
- `npm run build` / `npm run lint` → vérifs. `npm run check:rls` → audit isolation.

## Stack technique — TRANCHÉE (détail : `docs/stack-technique.md`)

Next.js 16 + **Vercel** · Supabase (Postgres/Auth/RLS + Storage URL signées, EU)
· transcription OpenAI mini · extraction Claude Haiku 4.5 · synthèse Claude
Sonnet 4.6 · **route IA = API Anthropic directe + DPA EU** · Stripe. Comptes déjà
possédés : Supabase, Vercel, IA (OpenAI/Anthropic/Azure).

## Organisation équipe (2 devs, les deux codent)

| Dev | Domaine | Branches types |
|---|---|---|
| Allan | **Back-end** : base/RLS, fonctionnalités, pipeline IA (délègue à Claude Code) | `feat/auth`, `feat/pipeline`, `feat/tasks` |
| Alphime | **Front** : design, UX/UI, intégration, navigation | `feat/design-system`, `feat/capture` (front) |

- Le **contrat de données** est désormais figé (migration 0001) → Alph peut démarrer
  le design system **en parallèle** contre ce contrat.
- Rituel : `git pull` → branche dédiée → push → PR → l'autre relit → merge.

## Décisions encore ouvertes

- **Confirmation e-mail Supabase** : à laisser ON (prod) ou OFF (tests rapides) —
  le trigger crée l'org dans les deux cas, seul le login attend la confirmation.
- **Transcription** OpenAI direct vs Azure OpenAI EU — avant `feat/pipeline`.
- **Intégrations CRM/Airtable/Sheets/Notion** : phase 2 (export) vs MVP — à trois.
- **Route A vs Route B** : socle universel posé (multi-utilisateur), couche
  différenciante B (`shift_label`, anti-collision multi-équipe) en priorité 2,
  à trancher aux premiers retours testeurs.
