# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

| **Dernière mise à jour :** 2026-06-15
**Phase :** Prototype — 3 bugs critiques corrigés + quick wins UX (design system Scribe)
**Branche active :** `prototype`

---

**TL;DR (pour Discord)**

**Les modules sont enfin reliés.** Jusqu'ici `capture` / `tasks` / `report` /
`billing` existaient en îlots isolés, sans aucun lien, et l'accueil pointait
vers rien. Construit sur `feat/capture-audio` :
`src/components/DashboardNav.tsx` (barre basse fixe mobile-first, route active via `usePathname`, icônes SVG inline, safe-area iOS), `src/app/dashboard/layout.tsx` (fond sombre du design system + espace réservé sous la nav, appliqué aux 5 pages), `src/app/dashboard/page.tsx` (l'accueil devient un hub sombre avec cartes d'accès rapide + synthèse org). Bonus : 2 erreurs lint pré-existantes de Phase 4 corrigées (`reports/actions.ts`) pour garder la CI verte.
Build OK, lint propre. `check:rls` non exécutable sur ce poste (pas de `SUPABASE_DB_URL`) mais sans objet : module 100 % front, zéro migration. Poussé sur origin, pas de PR (attente accord).

---

## Fait

- [x] **Bugs critiques + quick wins UX (2026-06-15, `prototype`)** : (1) `updateTask` ne fuit plus cross-org — client admin conservé pour la coordination mais refiltré strictement sur l'`org_id` de la session ; (2) statut harmonisé `done` partout (le rapport comptait `"fait"`, jamais écrit par l'UI) ; (3) les notes écrites passent enfin dans le pipeline (`processEntry` pour audio **et** texte). UX : design system Scribe tokenisé dans `globals.css` (`@theme` Tailwind v4 — marine/cloud/cyan/blue), rupture avec Atelier Klar sur tout le dashboard ; nav basse à contraste réel (cyan actif + barre, slate inactif) ; empty states utiles (Tâches, Rapport) ; marqueurs `PHASE x DONE` et emojis billing supprimés. tsc + eslint propres. Détail dans `historique.md`.
- [x] **Navigation + dashboard-hub (2026-06-14)** : `DashboardNav.tsx` (barre basse fixe, route active) + `dashboard/layout.tsx` (thème sombre commun + nav sur les 5 pages) + accueil refait en hub avec cartes d'accès rapide. Les modules sont reliés. Lint propre, build OK. Détail dans `historique.md`.
- [x] **Phase 5 Billing (2026-06-13)** : webhook Stripe + `createCheckoutSession` + page billing + migration 0005. Build OK. check:rls vert. `/dashboard/billing` protégé par `proxy.ts`. Stripe en mode TEST, prix en placeholder via env. Détail + bugs corrigés dans `historique.md`.
- [x] **Phase 4 Rapport (2026-06-13)** : 4 fichiers construits (`reports/actions.ts`, `ReportCard.tsx`, `GenerateReportButton.tsx`, `report/page.tsx`). Build OK. check:rls vert. Page `/dashboard/report` : génération via Claude Sonnet 4.6, accusés de lecture RLS-safe, état vide avec bouton de génération.
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

- **feat/billing construite** — en attente de push + PR pour revue Allan/Alphime.
- **Stripe à configurer (Allan)** : créer les produits/prix en mode TEST, renseigner `STRIPE_*` dans `.env.local`, déclarer le webhook `POST /api/stripe/webhook` (récupérer `STRIPE_WEBHOOK_SECRET`).
- **Attente GitHub Pro** pour protection de main (optionnel tant que pas de Vercel).

## Prochaines étapes (par ordre)

1. Push `feat/billing` → PR → revue → merge `main`.
2. Allan : configurer Stripe (produits, prix, webhook) en mode TEST puis tester un upgrade de bout en bout.
3. Brancher la consommation réelle (`minutes_used_this_period`) sur le pipeline transcription + reset périodique.
4. Avant prod : réactiver la confirmation e-mail + SMTP (Brevo) + bascule Stripe en mode live.

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
