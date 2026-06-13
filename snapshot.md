# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

| **Dernière mise à jour :** 2026-06-13
**Phase :** 3 — feat/tasks : Affichage et validation des tâches extraites ✅
**Branche active :** `feat/tasks`

---

**TL;DR (pour Discord)**

**Phase 3 Tasks construite et validée.** Les 4 fichiers sont en place sur `feat/tasks` :
`src/lib/tasks/actions.ts` (updateTask via admin client), `src/components/TaskCard.tsx` (badge priorité couleur + boutons Valider/Terminé), `src/components/TaskList.tsx` (groupement par priorité haute/moyenne/basse), `src/app/dashboard/tasks/page.tsx` (Server Component fetch + TaskList).
Build OK, check:rls vert. Page affiche PHASE 3 DONE.

---

## Fait

- [x] **Phase 3 Tasks (2026-06-13)** : 4 fichiers construits (`tasks/actions.ts`, `TaskCard.tsx`, `TaskList.tsx`, `tasks/page.tsx`). Build OK. check:rls vert. Page `/dashboard/tasks` groupée par priorité, Valider/Terminé via server actions admin.
- [x] **Phase 1 Capture (2026-06-13)** : 4 fichiers construits (`actions.ts`, `AudioRecorder.tsx`, `NoteInput.tsx`, `capture/page.tsx`). Build OK. check:rls vert.
- [x] **Recherches SMTP + Transcription tranchées (2026-06-13)** : SMTP → Brevo (France, 9k/mois gratos, Supabase 2 min). Transcription → OpenAI direct (1,80€/mois MVP), Azure EU backup si RGPD client nécessaire.
- [x] **Hermes opérationnel sur le sandbox (2026-06-13)** : cloné le repo, gh auth ADMIN, sandbox Supabase doorjfxqetoawqnvguvz provisionné, .env.local avec mot de passe DB, migrations appliquées (0001 + 0002 déjà à jour), 4/4 test:isolation OK, check:rls vert.
- [x] **Claude Code authentifié** sur le VPS Hermes (compte morjonallan@gmail.com).
- [x] **`main` rattrape tout le projet (2026-06-13)** : fusion fast-forward de `feat/integration-hermes` → `main` (auth + sécurité + migrations + CI + docs Hermes, 14 commits).
- [x] **Socle `feat/auth`** (sessions précédentes) : Next.js 16 PWA + auth sessions Supabase + RLS par org, projet Supabase EU provisionné, isolation prouvée 4/4.
- [x] **Repo poussé sur GitHub** : `main`, `feat/auth`, `feat/integration-hermes`.
- [x] **CI GitHub Actions sans secret** : lint + build + migrations + `check:rls` contre un conteneur `supabase/postgres`.
- [x] **`HERMES.md`** + **`docs/setup-claude-code-vps.md`** + **`docs/briefing-hermes-telegram.md`**.
- [x] **Cockpit Atelier Klar** : login Hermes (♣ vert) déployé sur Netlify.

## En cours / bloqué

- **feat/tasks construite** — en attente de push + PR pour revue Allan/Alphime.
- **Attente GitHub Pro** pour protection de main (optionnel tant que pas de Vercel).

## Prochaines étapes (par ordre)

1. Push `feat/tasks` → PR → revue → merge `main`.
2. Avant prod : réactiver la confirmation e-mail + SMTP (Brevo).
3. `feat/rapport` (Phase 4) : synthèse du soir via Claude Sonnet 4.6 + rapport de passation.

## Comment lancer (mémo équipe)

- **Repo** : https://github.com/Allan77bot/scribe-app (privé).
- **Projet Supabase réel** : `scribe` (org Atelier Klar), EU Frankfurt, ref `kgbxxzujlubflsvprmef`. Clés dans `.env.local` (**non commité**, partagé hors-repo). **Hermes n'utilise JAMAIS ce projet** → sandbox dédié (`HERMES.md`).
- `npm install` puis `npm run dev` → http://localhost:3000.
- `npm run build` / `npm run lint` / `npm run test:isolation` / `npm run check:rls`.
- **Page capture** : http://localhost:3000/dashboard/capture (après login).

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

## Décisions encore ouvertes

- **GitHub Pro** pour la protection mécanique de `main` (cf. En cours).
- **Intégrations CRM/Airtable/Sheets/Notion** : phase 2 vs MVP — à trois.
- **Route A vs Route B** : couche B (`shift_label`, anti-collision) en priorité 2.

## Décisions tranchées par Hermes

- **SMTP transactionnel** → **Brevo (Sendinblue)** : serveurs Paris, 9k emails/mois gratuits, intégration Supabase 2 min. ✅
- **Transcription** → **OpenAI Whisper API direct** pour le MVP (~1,80€/mois). **Azure OpenAI EU** backup si RGPD client. **Whisper local** trop lourd. ✅
