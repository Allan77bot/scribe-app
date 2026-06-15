# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

| **Dernière mise à jour :** 2026-06-15
**Phase :** Prototype — niveau 2 (structurel) + niveau 3 (vision) construits
**Branche active :** `prototype`

---

**TL;DR (pour Discord)**

**Le front passe en clair — design « Professional Flow ».** Migration complète
du thème **sombre → clair** (source de vérité `DESIGN.md`) : police **Manrope**,
fond `#f7fafd`, **cartes blanches** rayon 32px + ombres douces navy, **boutons
primary pilule 56px** (`#0059bb`), **inputs sans bordure** rayon 16px, **titres
Deep Navy** `#002b5b`. Tokens redéfinis dans `globals.css` (`@theme` Tailwind v4,
pas de `tailwind.config.ts`) ; **28 fichiers UI** migrés (landing, nav, layout
1200px, 12 pages, 13 composants) ; **zéro trace du dark**. `tsc`/`eslint`/`next
build` verts (20 routes). Pas de PR (attente accord).

_Session précédente :_
**Les invitations d'équipe sont vivantes.** Au-dessus de la boucle de coordination,
on branche les **acteurs** : table `invitations` à **jeton signé** (UUID v4 +
e-mail + expiration 72 h, jamais de rattachement par `org_id` brut — règle d'or
n°1/n°2), **`POST /api/invites/send`** (admin, e-mail Brevo, retourne le lien),
**`GET /api/invites/pending`** (admin), page publique **`/invite/accept?token=`**
(jeton validé serveur, e-mail verrouillé, signup → trigger → org auto en rôle
`member`), page **`/dashboard/team`** (membres + invitations en attente +
révocation) et feuille **InviteMemberButton**. Nav réduite à **Accueil · Capturer ·
Tâches · Passation · Équipe** (Rapport passe au hub). **Onboarding étape 2 activée**.
Migration `0007` (`invitations` + RLS 4 policies + `handle_new_user` étendu).
`tsc`/`eslint`/`next build` verts (20 routes). Pas de PR (attente accord).

_Rappel boucle de coordination (sessions précédentes) : pipeline asynchrone,
validation humaine Accepter/Modifier/Rejeter (`task_validations`), accusés de
lecture chiffrés, passation 3×8, onboarding wizard, dashboard refondu, quota
minutes réel ; règle d'or n°5 réparée, XSS fermé. Migration `0006`._

---

## Fait

- [x] **Migration design dark → clair « Professional Flow » (2026-06-15, `prototype`)** :
  refonte complète du design system selon `DESIGN.md`. `globals.css` réécrit
  (`@theme` Tailwind v4 : surfaces/on-surface/primary/secondary navy/azure/error,
  rayons `rounded-field`/`rounded-card`/`rounded-pill`, ombres navy `shadow-card`/
  `shadow-modal`) ; **Manrope** via `next/font` ; 28 fichiers UI migrés (cartes
  blanches 32px, boutons primary pilule 56px, inputs sans bordure, layout 1200px,
  nav active `primary`). Zéro token dark résiduel. `tsc`/`eslint`/`build` verts
  (20 routes). `DESIGN.md` ajouté au repo. Détail dans `historique.md`.
- [x] **Invitations d'équipe + page Équipe + nav (2026-06-15, `prototype`)** : table
  `invitations` à jeton signé (migration `0007` : org_id + RLS 4 policies admin),
  `handle_new_user()` étendu (jeton valide → rejoint l'org en `member`, sinon org
  neuve admin), `POST /api/invites/send` + `GET /api/invites/pending` (admin only),
  page publique `/invite/accept` (e-mail verrouillé), `/dashboard/team`,
  `InviteMemberButton` (bottom sheet) + `AcceptInviteForm` + `RevokeInviteButton`.
  Nav : Rapport → Équipe (Rapport au hub). Onboarding étape 2 réellement active.
  Build/lint/tsc verts (20 routes). Détail dans `historique.md`.
- [x] **Niveau 2 + niveau 3 (2026-06-15, `prototype`)** : pipeline async (`after()`),
  boucle de validation humaine + table `task_validations` (audit attribué, règle
  d'or n°4), accusés de lecture chiffrés (`ReadReceiptList`), passation 3×8
  (`/dashboard/handover`), onboarding wizard (`/dashboard/onboarding` + `onboarding_complete`),
  refonte dashboard à widgets, quota minutes réel. Fond : règle d'or n°5 (Sonnet 4.6
  synthèse / Haiku 4.5 extraction), sanitizer anti-XSS, fin de l'Atelier Klar sur le
  dashboard. Migration `0006`. Build/lint/tsc verts. Détail dans `historique.md`.
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

- **Migrations `0006` + `0007` à appliquer** : `npm run db:apply` puis
  `npm run check:rls` (vert) sur le sandbox/CI — non exécutable ici
  (`SUPABASE_DB_URL` absent). `invitations` conforme au patron (org_id + RLS + 4
  policies) ; `0007` remplace `handle_new_user()` (gestion du jeton d'invitation).
- **Limite invitations** : un e-mail déjà inscrit sur Scribe ne peut pas accepter
  une invitation (signup refusé) → multi-org par compte = TODO post-MVP.
- **Gabarit e-mail encore en charte Atelier Klar** (`email/send.ts`) : migrer aux
  tokens Scribe dans une branche `feat/email-brand` dédiée.
- **Reset périodique du quota** : `minutes_used_this_period` est maintenant
  incrémenté, mais pas remis à zéro en début de période (à brancher sur Stripe).
- **Stripe à configurer (Allan)** : produits/prix mode TEST, `STRIPE_*` dans
  `.env.local`, webhook `POST /api/stripe/webhook`.
- **Attente GitHub Pro** pour protection de main (optionnel tant que pas de Vercel).

## Prochaines étapes (par ordre)

1. Appliquer les migrations `0006` + `0007` + `check:rls` vert (sandbox/CI).
2. Revue + PR `prototype` → merge selon accord Allan/Alphime.
3. Migrer le gabarit e-mail aux tokens Scribe (`feat/email-brand`).
4. Reset périodique de `minutes_used_this_period` (webhook Stripe / cron).
5. Avant prod : confirmation e-mail + SMTP (Brevo) + Stripe en mode live.

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
