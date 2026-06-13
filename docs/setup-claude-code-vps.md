# Setup Claude Code sur le VPS — exécutant code d'Hermes

> Guide d'installation pour que l'instance Claude Code du VPS travaille sur
> `scribe-app` exactement comme celle du poste d'Allan. Destinataire : Allan
> (ou Hermes s'il exécute lui-même, étape par étape).
> Spec : `docs/superpowers/specs/2026-06-12-integration-hermes-design.md` §3.6.

## 1. Prérequis VPS

- Node.js ≥ 18.18 (`node -v`) et git.
- Un dossier de travail dédié, ex. `~/work/scribe-app`.

## 2. Installation et connexion

```bash
npm install -g @anthropic-ai/claude-code
claude          # premier lancement → login avec l'abonnement (compte Claude)
```

## 3. Accès au repo

```bash
# PAT GitHub fine-grained créé par Allan : repo scribe-app UNIQUEMENT,
# permissions Contents (read/write) + Pull Requests (read/write). Rien d'autre.
git clone https://<PAT>@github.com/Allan77bot/scribe-app.git ~/work/scribe-app
cd ~/work/scribe-app
git config user.name "Hermes (Atelier Klar)"
git config user.email "hermes@atelierklar.fr"
```

Le PAT vit dans la config du remote (ou un credential store local au VPS) —
**jamais dans le repo, jamais dans un commit, jamais dans le Journal.**

## 4. Environnement sandbox

Créer `~/work/scribe-app/.env.local` (le `.gitignore` l'exclut déjà) avec les
clés du projet **`scribe-sandbox`** (compte Supabase dédié — voir `HERMES.md`).
Modèle : `.env.example`. **Aucune clé du projet réel EU sur ce VPS, jamais.**

Vérification de mise en route :

```bash
npm install
npm run db:apply         # applique les migrations sur le sandbox
npm run test:isolation   # doit afficher 4/4
npm run check:rls        # doit être vert
```

## 5. Plugins / skills

Le repo embarque déjà `CLAUDE.md`, `HERMES.md` et `.claude/commands/`
(`/check-rls`, `/nouvelle-table`) — disponibles dès le clone.

Pour le confort (optionnel mais recommandé, c'est l'outillage du poste d'Allan) :

```bash
claude
> /plugin marketplace add anthropics/claude-plugins-official
> /plugin install superpowers
```

**Lecture recommandée** : `docs/methode-claude-code.md` — la méthode d'Allan
pour piloter Claude Code (modèle mental, skills/subagents/hooks, boucle
plan → exécution → vérification). Utile dès que tu délègues du code en headless.

## 6. Invocation par Hermes (headless)

Hermes lance Claude Code en mode non-interactif depuis le clone :

```bash
cd ~/work/scribe-app
claude -p "Lis HERMES.md puis snapshot.md. Tâche : <texte de la carte Board>. \
Travaille sur une branche dédiée et ouvre une PR — jamais de push sur main." \
  --permission-mode bypassPermissions
```

**Le mode bypass n'est acceptable ici QUE parce que** (spec §3.6) :
1. le VPS ne détient que des clés sandbox — rien de réel à casser ;
2. `main` n'accepte que des PR (voir note ci-dessous) ;
3. la CI (lint + build + migrations + check:rls) doit être verte avant merge.

> **Note protection `main`** : la protection de branche GitHub exige le plan
> Pro sur un repo privé. Décision Allan (2026-06-12) : pas de Pro pour l'instant —
> la règle « jamais de push main » de `HERMES.md` n'est donc PAS appliquée
> mécaniquement. Risque accepté car aucun déploiement n'est branché sur `main`
> de ce repo (un push accidentel se revert). À reconsidérer dès que Vercel
> sera connecté. En attendant : PAT fine-grained obligatoire (jamais le compte
> Allan77bot complet sur le VPS) — `echo <PAT> | gh auth login --with-token`
> donne la CLI `gh` limitée à ce seul repo.

## 7. Boucle de travail type

1. Hermes lit le Board → carte `Responsable = Hermes`, projet `Scribe`.
2. Hermes (ou son Claude Code) exécute → branche → commits → PR.
3. Hermes journalise (onglet `Journal`) + prévient Allan sur Telegram avec le lien PR.
4. CI verte → revue Claude → merge par Allan.
