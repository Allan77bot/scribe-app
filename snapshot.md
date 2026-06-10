# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

**Dernière mise à jour :** 2026-06-10
**Phase :** 1 — `feat/auth` **TERMINÉ et vérifié en réel** (projet Supabase EU
provisionné, isolation prouvée 4/4). Prêt pour la PR croisée puis `feat/capture`.
**Branche active :** `feat/auth` (repo git local, non poussé)

---

## TL;DR (pour Discord)

Le **socle d'isolation est terminé et prouvé en réel** sur `feat/auth` : Next.js 16
(PWA mobile-first) + auth sessions Supabase + RLS par org. **Projet Supabase EU
(Frankfurt) provisionné**, migration appliquée, **test d'isolation 4/4 vert** (org A
ne voit rien d'org B), `check:rls` vert, **audit de sécurité adversarial passé**.
Flux inscription → login → dashboard → logout opérationnel (auto-confirm activé pour
les tests). **Plus de blocage.** Prochain pas : PR croisée (Alph valide le schéma)
puis `feat/capture`. Toujours **pas poussé** sur GitHub (pas de PR sans accord).

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
- [x] **Supabase Security Advisor** : Critical résolu (RLS sur `_scribe_migrations`),
      droits des fonctions durcis (migration `0002`). Reste 3 alertes bénignes/assumées
      (dont 1 WARN payante HIBP). Détail → `historique.md`.

## En cours / bloqué

- **Rien de bloqué.** Le socle est complet et **vérifié en réel**. En attente d'une
  décision : ouvrir la PR croisée `feat/auth` (validation schéma par Alphime) + pousser.

## Prochaines étapes (par ordre)

1. **Révoquer le Personal Access Token** Supabase (le setup est fait) — ou le garder
   si on veut reprovisionner plus tard → https://supabase.com/dashboard/account/tokens
2. PR croisée `feat/auth` : **Alphime valide le schéma** (prérequis #2) → merge.
   (Décider quand pousser sur GitHub — rien n'est poussé pour l'instant.)
3. `feat/capture` (audio par URL signée) — le front peut démarrer contre le
   contrat de données déjà figé ici.
4. **Avant prod** : réactiver la confirmation e-mail + brancher un SMTP
   (auto-confirm est ON pour les tests).

## Comment lancer (mémo équipe)

- **Projet Supabase** : `scribe` (org Atelier Klar), région EU Frankfurt,
  ref `kgbxxzujlubflsvprmef`. Les clés vivent dans `.env.local` (**non commité** :
  Allan les partage hors-repo, ou chacun les copie depuis le dashboard Supabase).
- `npm install` puis `npm run dev` → http://localhost:3000.
- `npm run build` / `npm run lint` → vérifs. `npm run test:isolation` → preuve
  d'isolation. `npm run check:rls` → audit RLS.

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

- **Confirmation e-mail Supabase** : actuellement **OFF** (auto-confirm, pour les
  tests). À réactiver + brancher un SMTP avant la prod.
- **Transcription** OpenAI direct vs Azure OpenAI EU — avant `feat/pipeline`.
- **Intégrations CRM/Airtable/Sheets/Notion** : phase 2 (export) vs MVP — à trois.
- **Route A vs Route B** : socle universel posé (multi-utilisateur), couche
  différenciante B (`shift_label`, anti-collision multi-équipe) en priorité 2,
  à trancher aux premiers retours testeurs.
