# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

**Dernière mise à jour :** 2026-06-13
**Phase :** 1.5 — socle `feat/auth` + intégration Hermes **mergés dans `main`**
(fast-forward) : `main` contient désormais **tout le projet réel** (`Allan77bot/scribe-app`,
privé). Hermes voit l'intégralité sur la branche par défaut.
**Branche active :** `feat/integration-hermes` (à clore — prochain concern = nouvelle branche)

---

## TL;DR (pour Discord)

**`main` rattrape tout le projet** : fusion fast-forward de `feat/integration-hermes`
→ `main` (socle auth + sécurité + migrations + CI + docs Hermes). Hermes voit
désormais l'intégralité sur la branche par défaut, plus seulement des docs. Rappel :
**Hermes (agent autonome du VPS) rejoint le projet** en bac à sable — il bossera
sur son propre projet Supabase sandbox, par PR uniquement, piloté via le Board
Atelier Klar, avec Claude Code installé sur le VPS pour les grosses tâches code.
Une **CI sans secret** (lint + build + migrations + audit RLS sur conteneur jetable)
verrouille chaque PR. Il reste à Allan : PAT GitHub + compte Supabase sandbox +
décision GitHub Pro (protection de `main`), puis coller le briefing Telegram à Hermes.

---

## Fait

- [x] **`main` rattrape tout le projet (2026-06-13)** : fusion **fast-forward** de
      `feat/integration-hermes` → `main` (auth + sécurité + migrations + CI + docs
      Hermes, 14 commits). `HERMES.md` et tous les docs sont sur la branche par défaut.
      Briefing portable Atelier Klar ajouté (`tests/projethermes.md`).
- [x] **Socle `feat/auth`** (sessions précédentes) : Next.js 16 PWA + auth sessions
      Supabase + RLS par org, projet Supabase EU provisionné, isolation prouvée 4/4,
      audit adversarial passé, Security Advisor traité. Détail → `historique.md`.
- [x] **Repo poussé sur GitHub** : `main`, `feat/auth`, `feat/integration-hermes`.
- [x] **Spec intégration Hermes validée** →
      `docs/superpowers/specs/2026-06-12-integration-hermes-design.md`.
- [x] **CI GitHub Actions sans secret** : lint + build + migrations + `check:rls`
      contre un conteneur `supabase/postgres` (chaîne testée verte en local).
- [x] **`HERMES.md`** (briefing agent + mur déterministe) +
      **`docs/setup-claude-code-vps.md`** (Claude Code headless sur le VPS) +
      **`docs/briefing-hermes-telegram.md`** (message prêt à coller + 5 cartes Board).
- [x] **Cockpit Atelier Klar** : login Hermes (♣ vert) déployé sur Netlify.

## En cours / bloqué

- **En attente d'Allan (pour activer Hermes)** :
  1. PAT GitHub fine-grained (repo `scribe-app` seul, Contents + Pull requests) ;
  2. compte Supabase **sandbox dédié** (`contact@atelierklar.fr`) + PAT ;
  3. décision **GitHub Pro** (~4 $/mois) — la protection de `main` est refusée en
     plan Free sur repo privé ; recommandé AVANT de donner le PAT à Hermes ;
  4. coller le briefing Telegram (`docs/briefing-hermes-telegram.md`) + créer
     les cartes Board.

## Prochaines étapes (par ordre)

1. Allan exécute la checklist ci-dessus → Hermes clone, lit `HERMES.md`,
   provisionne son sandbox, prouve l'isolation (cartes Board 1-3).
2. **Revue post-merge par Alphime** : le schéma `feat/auth` est arrivé sur `main` sans
   la PR croisée prévue (conséquence assumée du merge direct) → lui faire relire `main`.
3. `feat/capture` (audio par URL signée) — front démarrable contre le contrat figé.
4. Avant prod : réactiver la confirmation e-mail + SMTP (recherche déléguée à
   Hermes, carte Board 4).

## Comment lancer (mémo équipe)

- **Repo** : https://github.com/Allan77bot/scribe-app (privé).
- **Projet Supabase réel** : `scribe` (org Atelier Klar), EU Frankfurt,
  ref `kgbxxzujlubflsvprmef`. Clés dans `.env.local` (**non commité**, partagé
  hors-repo). **Hermes n'utilise JAMAIS ce projet** → sandbox dédié (`HERMES.md`).
- `npm install` puis `npm run dev` → http://localhost:3000.
- `npm run build` / `npm run lint` / `npm run test:isolation` / `npm run check:rls`.

## Stack technique — TRANCHÉE (détail : `docs/stack-technique.md`)

Next.js 16 + **Vercel** · Supabase (Postgres/Auth/RLS + Storage URL signées, EU)
· transcription OpenAI mini · extraction Claude Haiku 4.5 · synthèse Claude
Sonnet 4.6 · **route IA = API Anthropic directe + DPA EU** · Stripe.

## Organisation équipe (2 devs + 2 agents)

| Acteur | Domaine | Branches types |
|---|---|---|
| ♦ Allan | Valide PR et décisions, pilote Hermes (Telegram/Board) | — |
| ♠ Alphime | **Front** : design, UX/UI, intégration | `feat/design-system`, `feat/capture` (front) |
| ♥ Claude (poste Allan) | **Cœur back-end** : base/RLS, pipeline IA | `feat/auth`, `feat/pipeline` |
| ♣ Hermes (VPS + Claude Code) | **Sandbox/annexe** : recherches, tests, docs, code périphérique — PR only | `feat/*`, `chore/*` (jamais `main`) |

- Contrat de données figé (migration 0001) → Alph peut designer en parallèle.
- Rituel : `git pull` → branche dédiée → push → PR → CI verte → revue → merge humain.

## Décisions encore ouvertes

- **GitHub Pro** pour la protection mécanique de `main` (cf. En cours).
- **Confirmation e-mail Supabase** : OFF (auto-confirm tests) → réactiver + SMTP
  avant prod (recherche : carte Hermes).
- **Transcription** OpenAI direct vs Azure OpenAI EU (recherche : carte Hermes).
- **Intégrations CRM/Airtable/Sheets/Notion** : phase 2 vs MVP — à trois.
- **Route A vs Route B** : couche B (`shift_label`, anti-collision) en priorité 2.
