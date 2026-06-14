# Snapshot — où on en est

> État **présent** du projet. Réécrit à chaque session (historique → `historique.md`).
> Conçu pour être copié/collé sur Discord lors d'un point d'équipe.

**Dernière mise à jour :** 2026-06-14
**Phase :** Hermes — capacités (soul + apprentissage + dreaming) construites, auditées, corrigées ✅
**Branche active :** `feat/hermes-capabilities` (auditée + prouvée, **prête à merger**, non mergée)

---

**TL;DR (pour Discord)**

Nuit du 13→14 : on a doté Hermes de son **manifeste « soul »** (identité co-gérant
d'Atelier Klar + 3 piliers de l'année), branché le **skill `A:`** (apprendre d'une
vidéo → Mem0) et la **boucle dreaming** (briefing matinal des leçons validées).
Hermes a déployé tout ça en autonomie sur le VPS. **Audit multi-agents** : discipline
nickel (rien sur `main`, zéro clé fuitée, scope minimal), mais `dream()` était cassé
(bug dict/liste mem0ai v2.0.5) → **corrigé + prouvé** (le filtre ne ressort QUE les
leçons validées → règle d'or n°4 OK). Reste : décider du merge + câbler les
credentials du brief matinal.

---

## Fait

- [x] **Manifeste « soul » d'Hermes (2026-06-13)** : identité + 3 piliers + hors-périmètre + métriques + com + permission → `manifeste-soul-hermes.md`, chargé en mémoire système Mem0 (verbatim).
- [x] **Skill `A:` + boucle dreaming (2026-06-14)** : `apprendre.py` (`check_sender`/`watch_video`/`save_lesson`/`validate_lesson`/`dream`), déployé sur le VPS par Hermes (suivant `kit-transmission-hermes.md`).
- [x] **Audit adversarial (2026-06-14)** : 3 bugs high trouvés → **corrigés + prouvés au runtime** (dict/liste `dream()` → commit `64408c4` ; filtre `valide_allan` testé ; retour `add(infer=False)`). Pièges API → mémoire `mem0ai-v205-gotchas`.
- [x] **Méthode de session documentée** → `skillorganisation.md`. Runbooks → `kit-transmission-hermes.md`, `kit-credentials-hermes.md`.
- [x] *(sessions précédentes)* **Socle Scribe** : Next.js 16 PWA + auth sessions Supabase + RLS par org (isolation prouvée 4/4), CI sans secret verte, Hermes opérationnel sur le sandbox Supabase. Détail → `historique.md`.

## En cours / bloqué

- **Merge `feat/hermes-capabilities` → `main`** : audité + prouvé, attend la décision d'Allan.
- **Brief matinal d'Hermes** bloqué sur 3 accès (Google, Telegram, clés IA). **Décision 2026-06-14 : garder l'OAuth complet d'Allan** (Gmail/Drive/Sheets/devis-factures), **pas** de service account. Fix durable = app OAuth « En production » (sinon refresh token mort à 7 j) + token dans l'env du cron. Diag d'Hermes attendu (token absent du cron vs expiré). Runbook : `kit-credentials-hermes.md`.
- ⚠️ **Cron `Watchdog tâches Board` en échec** : `task_watchdog.py` introuvable (`/home/hermes/.hermes/profiles/prospection/scripts/`). À diagnostiquer côté VPS (script jamais créé ? mauvais profil ? chemin du cron faux).
- **Dossier « organisation » (structure boîte)** : fusionner avec le repo Scribe ou garder séparé ? **Reco : séparé** (produit SaaS ≠ ops boîte). À trancher avec Allan.
- ⚠️ **Protection de `main`** : Vercel déploie depuis le repo → à re-soulever (GitHub Pro ?).

## Prochaines étapes (par ordre)

1. **Réparer le cron `Watchdog tâches Board`** (VPS) : `task_watchdog.py` introuvable → retrouver/recréer au bon chemin + bon profil.
2. **Câbler les credentials du brief** : OAuth Google durable (app « En production » + token dans l'env du cron) + token Telegram → `kit-credentials-hermes.md`.
3. **Décider du merge** de `feat/hermes-capabilities` vers `main`.
4. **Polish optionnel** `apprendre.py` : garde-fou `save_lesson`, test stubbé, `__pycache__/` dans `.gitignore`, identité git dédiée Hermes.
5. Reprendre le **cœur Scribe** : `feat/capture` (audio par URL signée).

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

- **Merge `feat/hermes-capabilities` → `main`** (audité, prêt — décision Allan).
- **GitHub Pro** pour la protection mécanique de `main` (urgent depuis que Vercel déploie).
- **Intégrations CRM/Airtable/Sheets/Notion** : phase 2 vs MVP — à trois.
- **Route A vs Route B** : couche B (`shift_label`, anti-collision) en priorité 2.

## Décisions tranchées par Hermes

- **SMTP transactionnel** → **Brevo (Sendinblue)** : serveurs Paris, 9k emails/mois gratuits, intégration Supabase 2 min. ✅
- **Transcription** → **OpenAI Whisper API direct** pour le MVP (~1,80€/mois). **Azure OpenAI EU** backup si RGPD client. **Whisper local** trop lourd. ✅
