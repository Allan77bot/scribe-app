# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

| **Dernière mise à jour :** 2026-06-13
**Phase :** 0 — Coquille UI mobile-first ✅
**Branche active :** `feat/p0-coquille-ui` → PR #2 vers `prototype`

---

**TL;DR (pour Discord)**

**Hermes est en ligne sur le sandbox Scribe** 🎉 VPS opérationnel, sandbox OK, migrations OK. P0 coquille UI faite, PR #2 vers prototype. Prochaine étape : P1 capture (push-to-talk + URL signée), puis P2 pipeline IA (clés OpenAI nécessaires).

---

## Fait

- [x] **Phase 0 — Coquille UI mobile-first (2026-06-13)** : BottomNav (3 onglets : Capturer/Tâches/Rapport), layout dashboard, placeholders, build OK. PR #2 vers `prototype`.
- [x] **Recherches SMTP + Transcription tranchées (2026-06-13)** : SMTP → Brevo (France, 9k/mois gratos, Supabase 2 min). Transcription → OpenAI direct (1,80€/mois MVP), Azure EU backup si RGPD client nécessaire.
- [x] **Hermes opérationnel sur le sandbox (2026-06-13)** : cloné le repo, gh auth ADMIN, sandbox Supabase doorjfxqetoawqnvguvz provisionné, .env.local avec mot de passe DB, migrations appliquées (0001 + 0002 déjà à jour), 4/4 test:isolation OK, check:rls vert.
- [x] **Claude Code authentifié** sur le VPS Hermes (compte morjonallan@gmail.com).

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

- **Hermes opérationnel — sandbox prêt, environnements OK**. Prochaines tâches : créer les cartes Board (5 tâches), puis attaquer les recherches SMTP et transcription.
- **Attente GitHub Pro** pour protection de main (optionnel tant que pas de Vercel).

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
- **Intégrations CRM/Airtable/Sheets/Notion** : phase 2 vs MVP — à trois.
- **Route A vs Route B** : couche B (`shift_label`, anti-collision) en priorité 2.

## Décisions tranchées par Hermes

- **SMTP transactionnel** → **Brevo (Sendinblue)** : serveurs Paris, 9k emails/mois gratuits, intégration Supabase 2 min. ✅
- **Transcription** → **OpenAI Whisper API direct** pour le MVP (~1,80€/mois). **Azure OpenAI EU** backup si RGPD client. **Whisper local** trop lourd. ✅
