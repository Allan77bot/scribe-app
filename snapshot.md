# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

**Dernière mise à jour :** 2026-06-10
**Phase :** 0 — fondation posée (doc + analyse + stack tranchée), blocages levés,
code pas encore démarré
**Branche active :** `claude/exciting-hawking-w6ji33`

---

## TL;DR (pour Discord)

Fondation prête : doc structurée (index/snapshot/historique/spec), prototype
analysé (`docs/analyse-legacy.md`) et **stack technique tranchée**
(`docs/stack-technique.md`). **Toutes les décisions IA/infra sont prises (2026-06-10)** :
route IA = **API Anthropic directe** (DPA inclus avec les conditions commerciales,
no-training par défaut, transfert UE via SCC — **aucun blocage, zéro capex, paiement
à l'usage**), hébergement = **Vercel**, **Hermes = outil d'orga interne**. Rétention
= **variable selon le plan** ; résidence **Supabase EU = différenciateur assumé**
(les concurrents Plaud/Fathom/Otter stockent aux US). **OpenRouter/DeepSeek
rejetés** (anti-pattern RGPD). Équipe = 2 devs.
**Prochaine vraie étape : coder le socle `feat/auth`** (Supabase + organisations
+ RLS). Seul prérequis pour démarrer : créer le projet Supabase EU (sinon on écrit
les migrations en local en attendant).

---

## Fait

- [x] Architecture documentaire : `CLAUDE.md` (index slim), `snapshot.md`,
      `historique.md`, brief déplacé dans `docs/brief-produit.md`.
- [x] Workflow Git adopté : une préoccupation = une branche = une PR.
- [x] Prototype déposé dans `legacy/` et **analysé** → `docs/analyse-legacy.md`
      (IP à garder, mapping schéma → Supabase, anti-patterns à corriger).

## En cours

- Rien de codé pour l'instant. **Plan d'attaque rédigé** → `docs/plan-attaque.md`
  (prérequis, étapes `feat/auth`, roadmap, skills/commandes). Prêt à coder en VS Code.

## Prochaines étapes (par ordre)

1. **Socle d'isolation** : auth + organisations + RLS sur Supabase
   (`brief §10.1`). C'est la fondation, rien d'autre ne part avant.
   → branche dédiée `feat/auth`.
2. Capture (audio par URL signée) + pipeline transcription/extraction hybride.
   On réimporte le prompt WF1 + le schéma de champs (voir analyse §2-§3),
   on remplace seulement le transport audio (POST direct → URL signée).
3. Tâches + validation humaine + anti-collision (la vraie nouveauté, voir
   analyse §4 : tout ça manque dans le prototype).
4. Rapport quotidien + accusé de lecture (réutiliser prompt WF2 + template email).

## Stack technique — TRANCHÉE (détail : `docs/stack-technique.md`)

Next.js + **Vercel** · Supabase (Postgres/Auth/RLS + Storage URL signées, EU)
· transcription OpenAI mini · extraction Claude Haiku 4.5 · synthèse Claude
Sonnet 4.6 · **route IA = API Anthropic directe + DPA EU** (Bedrock = cible
future) · n8n au début → code ensuite · Stripe. Comptes déjà possédés :
Supabase, Vercel, IA (OpenAI/Anthropic/Azure).

## Organisation équipe (2 devs, les deux codent)

- Répartition par domaine pour éviter les collisions (chacun ses fichiers) :
  | Dev | Domaine | Branches types |
  |---|---|---|
  | Allan | **Back-end** : base/RLS, fonctionnalités, pipeline IA, dev appli (délègue à Claude Code) | `feat/auth`, `feat/pipeline`, `feat/tasks` |
  | Alphime | **Front** : design, UX/UI, intégration des fonctionnalités, navigation | `feat/design-system`, `feat/capture` (front) |
- **Workflow en 2 temps + parallèle** : Allan pose le socle back-end (contrat de
  données + API), Alph relit/juge, Allan adapte → puis Alph enchaîne sur le front.
  Pour aller plus vite : dès que le **modèle de données + le contrat d'API** sont
  figés (tôt, ensemble), Alph peut démarrer le design system **en parallèle** contre
  ce contrat, sans attendre tout le back-end. On converge à l'intégration.
- Rituel : `git pull` → branche dédiée → push → PR → l'autre relit → merge.
- `snapshot.md` = point de rendez-vous : on annonce sur Discord qui prend quelle
  branche pour ne pas se doubler.

## Décisions tranchées (plus aucun blocage IA/infra)

- ~~Compte AWS pour Bedrock~~ → **API Anthropic directe**. DPA auto avec les
  conditions commerciales, no-training par défaut, rétention 30j par défaut,
  SCC pour le transfert UE. **ZDR** (zéro-rétention) = option à demander plus tard
  si un gros client l'exige, pas nécessaire au MVP.
- ~~Vercel vs Netlify~~ → **Vercel**.
- ~~Rôle de Hermes~~ → outil d'orga interne, pas de doublon produit.
- **Rétention** → variable selon le plan (court inclus, plus long en payant).
- **OpenRouter / DeepSeek** → **rejetés** (route les données hors UE, pas de
  garantie RGPD — anti-pattern déjà acté dans `analyse-legacy.md`).

## Prêt à coder — chemin critique

**Bloquant réel pour la 1re ligne de code de `feat/auth`** :
1. Créer le **projet Supabase (région EU)** + récupérer URL/clés. *(Sinon : on écrit
   les migrations SQL + policies RLS en local, prêtes à appliquer.)*
2. **Alphime valide le schéma de données** (`brief §5`) avant d'écrire les tables.

**À faire en parallèle (pas bloquant pour démarrer le code)** :
- Accepter les **conditions commerciales Anthropic** (→ DPA) — avant `feat/pipeline`.
- Rédiger la **politique de confidentialité** listant les sous-traitants
  (Anthropic + OpenAI) — avant la mise en production.
- Trancher transcription **OpenAI direct vs Azure OpenAI EU** — avant `feat/pipeline`.

## Reste à décider à trois

- **Intégrations CRM / Airtable / Sheets / Notion** : phase 2 (export sortant)
  recommandé vs une synchro dès le MVP — à arbitrer selon les testeurs.

---

## Décision ouverte — cible Route A vs Route B

Le modèle de données est **multi-utilisateur dès le départ** (`brief §2-§5`),
donc **B-ready par conception** : ça ne coûte rien de garder la porte ouverte.

**Position actuelle (révisable) :**
- **Cible stratégique = Route B** (équipes en relais 3×8) — c'est là que la
  passation et l'anti-collision deviennent indispensables. C'est le moat.
- **Validation initiale = via les testeurs accessibles** (profil Route A,
  dirigeants/petites structures), qui valident la boucle de base.
- **Construction = socle universel d'abord** (sert A et B, zéro travail jeté),
  puis **couche différenciante B** (`shift_label`, anti-collision multi-équipe,
  tableau « qui a lu/quand ») en priorité 2.

À trancher franchement quand les premiers retours testeurs tombent.
