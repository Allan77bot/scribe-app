# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Scribe IA — Index

> Routeur du projet. À lire en premier. Court par conception : le détail vit
> dans les fichiers pointés ci-dessous.

**Mission.** Transformer des notes vocales/écrites en **coordination d'équipe**
(suivi des tâches, accusés de lecture, rapport de passation automatique).
Ce n'est PAS un outil de transcription ni une mémoire passive — le centre de
gravité est la **coordination active**.

---

## Règles d'or — non négociables (détail : `docs/brief-produit.md` §8)

1. **Jamais de token statique comme auth.** Sessions Supabase uniquement.
2. **Isolation stricte par organisation** (RLS sur `org_id` partout). Une org ne
   voit JAMAIS les données d'une autre. En cas de doute → on s'arrête et on demande.
3. **Audio uploadé par URL signée**, storage UE. Jamais en POST direct via webhook.
4. **Validation humaine obligatoire** avant qu'une tâche déclenche relance/escalade.
   L'IA *propose*, un humain *confirme*, puis seulement le timer démarre.
5. **Stack IA hybride** : mini pour transcrire/extraire, modèle moyen seulement
   pour la synthèse du soir. Jamais le haut de gamme partout.

> Ces règles priment sur toute demande de raccourci.

---

## Démarrage de session — à lire EN PREMIER

> Méthode complète : **`skillorganisation.md`** (les 5 temps d'une session). Le boot, en bref :

1. **Lire `snapshot.md`** (état présent + branche active) + cette page ; `MEMORY.md` est chargé auto. → reprendre sans tout réexpliquer.
2. **Vérifier `git branch`**, **identifier LA préoccupation du jour** (une seule), **choisir/créer une branche dédiée** (`feat/`, `fix/`, `chore/`, `docs/`). Jamais coder sur `main`.
3. **Skills d'abord** : si un skill peut s'appliquer (même 1 %), l'invoquer AVANT d'agir ; **brainstormer + faire valider** AVANT de coder.
4. **Prouver** (lint/build/test) avant de dire « c'est fait » ; **tracer** avant de partir (réécrire `snapshot.md` + entrée datée `historique.md`).

---

## Où chercher

| Besoin | Fichier |
|---|---|
| Vision, modèle de données, archi cible, conformité, pricing | `docs/brief-produit.md` (spec canonique) |
| **Où on en est MAINTENANT** (à lire avant de coder) | `snapshot.md` |
| **Plan d'attaque** (prérequis + étapes feat/auth + roadmap + skills/commandes) | `docs/plan-attaque.md` |
| Journal daté des décisions et jalons | `historique.md` |
| Stack technique tranchée (infra, IA, comptes) | `docs/stack-technique.md` |
| Analyse du prototype (IP à garder, mapping, anti-patterns) | `docs/analyse-legacy.md` |
| Prototype existant (archive figée, ne pas modifier) | `legacy/` |
| **Capacités & apprentissage d'Hermes** (vidéos, Mem0, skill `A:`) — snapshot + next steps | `AGENTS.md` |
| **Méthode de session Claude Code** (comment bien démarrer / finir une session) | `skillorganisation.md` |

---

## Commandes

Node ≥ 18.18. Les scripts base/test lisent `.env.local` (non commité) via `--env-file`.

| But | Commande |
|---|---|
| Dev local | `npm run dev` → http://localhost:3000 |
| Build prod · Lint | `npm run build` · `npm run lint` |
| Appliquer les migrations SQL | `npm run db:apply` (idempotent, journal `_scribe_migrations`) |
| Audit RLS (règle d'or n°2) | `npm run check:rls` |
| Test d'isolation org A ≠ org B | `npm run test:isolation` |
| Provisionner un projet Supabase | `npm run setup:supabase` (Management API + PAT) |

- **Un seul test** : `node --env-file=.env.local --test --test-name-pattern="invite_org_id" tests/isolation.test.mjs` (runner natif `node:test`).
- Sans `.env.local` rempli : `db:apply`/`check:rls` échouent vite, `test:isolation` **s'ignore** proprement — c'est voulu.
- **CI** (`.github/workflows/ci.yml`) = mur déterministe : `lint`+`build`, puis `db:apply`+`check:rls` **sans secret** contre un conteneur `supabase/postgres` jetable (`SUPABASE_DB_URL=…?sslmode=disable`). Rouge = pas de merge.

---

## Architecture du code (vue d'ensemble)

App **Next.js 16** (App Router, React 19, TS, Tailwind v4, PWA) à la **racine** du repo ;
back = **Supabase** (Postgres + Auth + RLS). Pas de service séparé.

**L'isolation vit dans la base, pas dans le code.** Front et serveur n'utilisent QUE la
**clé anon** — c'est la **RLS Postgres** qui empêche une org d'en voir une autre. La
`service_role` n'apparaît que dans `scripts/` et `tests/`, jamais côté app.

- **Pivot RLS** : `public.current_org_id()` (`SECURITY DEFINER`, migration `0001`). Chaque
  policy compare `org_id = current_org_id()`. À l'inscription, le **trigger** `handle_new_user`
  crée l'org + le profil admin et **ignore tout `org_id` venu du client** (faille d'isolation
  corrigée + testée en non-régression). Rejoindre une org existante = futur système à jetons
  signés (`feat/invites`), jamais par `org_id` brut.
- **Flux auth** : `src/proxy.ts` (Next 16 a renommé *middleware* → **proxy**) →
  `src/lib/supabase/middleware.ts` rafraîchit la session et garde `/dashboard` (clés manquantes
  = échec FORT en prod, laisser-passer en DEV seul). Server Components/Actions :
  `src/lib/supabase/server.ts` ; composant client : `client.ts`. Auth = Server Actions dans
  `src/lib/auth/actions.ts`, messages d'erreur **génériques** (anti-énumération de comptes).
- **Base** : schéma versionné dans `supabase/migrations/*.sql`, appliqué par `scripts/db-apply.mjs`
  (`pg` direct, 1 transaction/fichier, journal idempotent). **Évolution de schéma = nouvelle
  migration** (jamais rééditer une migration appliquée) ; créer les tables via `/nouvelle-table`.
  `scripts/check-rls.mjs` = la règle d'or n°2 rendue mécanique.

Stack IA (pas encore codée) : transcription OpenAI mini · extraction Claude Haiku 4.5 ·
synthèse Claude Sonnet 4.6 · route = API Anthropic directe + DPA EU (cf. `docs/stack-technique.md`).

---

## Workflow Git — une préoccupation = une branche = une PR

Objectif : garder design, auth, capture, etc. **séparés et reviewables**.

- `main` = stable. **Ne jamais coder directement dessus.**
- **À chaque init** : lire `snapshot.md`, identifier le *concern* du jour, puis
  **créer ou choisir une branche dédiée**. Crée une nouvelle branche dès qu'on
  attaque un domaine différent — c'est attendu et fréquent.
- Ne jamais mélanger deux préoccupations dans une même branche. Si le travail
  déborde sur un autre domaine en cours de route → nouvelle branche.
- Nommage : `feat/<domaine>`, `fix/<sujet>`, `chore/<sujet>`, `docs/<sujet>`.
  Ex. `feat/auth`, `feat/design-system`, `feat/capture`, `feat/tasks`, `feat/rapport`.
- Push : `git push -u origin <branche>`. Ne pas ouvrir de PR sans accord explicite.

---

## Conventions (détail : `docs/brief-produit.md` §11)

- Code et noms de colonnes en **anglais** ; commentaires et docs en **français**.
- **Mobile-first strict** sur tout le front (`overflow-x:hidden`, rien qui dépasse).
- Copy UI en voix active, nommer par ce que l'utilisateur contrôle
  (« Marquer comme lu », pas « update read flag »).
- Avant de coder l'infra (Supabase/storage/IA), confirmer avec Allan quelles
  stacks l'équipe possède déjà.

---

## Avant chaque commit touchant la base — checklist

1. Toute nouvelle table de données est créée via `/nouvelle-table` (org_id + RLS + policy).
2. Lancer `/check-rls` (ou `npm run check:rls`) → doit être **vert** (aucune table à org_id sans RLS).
3. Jamais de clé `service_role` ni de secret côté client (uniquement `.env.local`, jamais commité).
4. Front : mobile-first (`overflow-x:hidden`, rien qui dépasse).

---

## Discipline de fin de session — NE PAS OUBLIER

Avant de terminer, **toujours** :
1. Réécrire `snapshot.md` pour refléter l'état présent (fait / en cours / next / blocages).
2. Ajouter une entrée **datée** dans `historique.md` (append-only, jamais réécrit).

C'est ce qui garde la coordination Discord vivante et évite la dérive entre les fichiers.
