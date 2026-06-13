# Piloter Claude Code depuis Hermes — bonnes pratiques

> Le « comment » concret : comment l'orchestrateur **Hermes** fait travailler
> **Claude Code** en mode headless sur le VPS. Complète `docs/setup-claude-code-vps.md`
> (installation) et `docs/methode-claude-code.md` (méthode de fond).
> Sources : docs officielles `code.claude.com` (CLI reference + Agent SDK headless),
> guides SFEIR (CI/CD) et MindStudio (headless + cron).

## 1. Le principe

Hermes ne « discute » pas avec Claude Code de façon interactive : il le lance en
**one-shot non-interactif** (`claude -p "<tâche>"`). Claude lit le prompt, agit dans
le clone du repo, rend le résultat sur **stdout**, puis sort. Deux niveaux :

- **CLI headless** (`claude -p`) — simple, **suffisant pour Hermes**. On lance, on
  parse stdout, on lit le code de sortie.
- **Agent SDK** (`@anthropic-ai/claude-agent-sdk` JS · `claude-agent-sdk` Python) —
  pour un contrôle programmatique fin (streaming, hooks, callbacks de permission,
  sous-agents). Plus lourd → **commencer par le CLI**, passer au SDK seulement si besoin.

## 2. Chaîner les tours (mémoire entre appels)

- `--output-format json` → objet avec `result`, **`session_id`**, `total_cost_usd`,
  `usage`, `num_turns`, `is_error`.
- Récupérer `session_id`, puis **`--resume <session_id>`** pour enchaîner en gardant
  le contexte. `--continue` / `-c` = reprendre la dernière session du dossier.
  `--fork-session` = brancher une variante sans écraser la session d'origine.
- `--output-format stream-json` (NDJSON, token par token) si Hermes veut suivre la
  **progression en temps réel** ; sinon `json` (parsing en fin de réponse).

## 3. Permissions — LE point pour un agent autonome

En interactif, Claude demande confirmation avant `Bash`/`Edit` ; en headless ça
**bloquerait à l'infini** (personne pour confirmer). `--permission-mode` accepte :
`default`, `plan`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`.

- `bypassPermissions` (= `--dangerously-skip-permissions`) saute **tout** →
  **acceptable UNIQUEMENT dans le couloir sandbox d'Hermes** (clés sandbox, PR only,
  CI mur). C'est déjà la règle de `setup-claude-code-vps.md` §6.
- **Mieux (méthode Allan : allowlist > skip total)** — autoriser une liste précise :
  `--allowedTools "Read" "Edit" "Bash(git *)" "Bash(npm *)"` + `--disallowedTools "Bash(rm *)"`.
  Sécurité **et** fluidité.
- **`--permission-mode plan`** pour la phase de planification (il propose sans rien
  toucher), puis relancer en exécution → colle à la boucle plan → exécution → vérif.

## 4. Contexte gratuit + garde-fous

- Claude Code lit **automatiquement `CLAUDE.md` + `HERMES.md`** du dossier → Hermes
  n'a pas à re-spécifier les règles à chaque appel. Garder ces fichiers **compacts**.
- `--append-system-prompt "…"` : injecter une consigne ponctuelle sans toucher aux fichiers.
- `--add-dir <chemin>` : donner accès à un dossier hors du répertoire courant.
- **Hooks `PreToolUse`** = filet déterministe (véto sur patterns Bash dangereux, scan
  de secrets avant écriture), **indépendant du prompt** — ce qui doit toujours arriver.

## 5. Budget (vraies clés = vrai coût)

- `--max-turns N` plafonne les itérations agentiques (sort en erreur si dépassé).
- Lire `total_cost_usd` et `usage` dans la sortie json → suivre la dépense **par appel**
  et la **journaliser**.
- `claude setup-token` génère un **OAuth token longue durée** (`CLAUDE_CODE_OAUTH_TOKEN`)
  pour CI/scripts → tourner sur l'abonnement, sans clé API facturée séparée.

## 6. Robustesse (orchestration automatique)

- **Codes de sortie** : `0` OK · `1` erreur · `124` timeout → Hermes branche sa logique dessus.
- Wrapper `timeout 600 claude -p …` contre les appels qui pendent.
- **Retry + backoff** sur rate limit.
- Prompt **auto-suffisant** : aucune question interactive possible en headless → tout le
  contexte en amont (la tâche, où, comment tester). Mauvais prompt = échec silencieux.
- En cron/CI : fournir **explicitement** les variables d'env (clés + chemin du binaire
  `claude` via `which claude`) — le profil shell n'est pas chargé.

## 7. Recette pour la mission Scribe (par phase)

```bash
cd ~/work/scribe-app

# 1) PLAN — il propose, rien n'est touché
claude -p "Lis HERMES.md + le spec mission (docs/superpowers/specs/2026-06-13-prototype-app-complete-hermes-design.md). \
Phase N : <objectif>. Plan d'abord." \
  --permission-mode plan --output-format json --model sonnet

# 2) EXÉCUTION (sandbox) — allowlist + plafond de tours
claude -p "Exécute le plan validé. Branche dédiée → PR vers prototype, jamais main. \
Nouvelle table via /nouvelle-table, check:rls vert avant la PR." \
  --permission-mode acceptEdits \
  --allowedTools "Read" "Edit" "Bash(git *)" "Bash(npm *)" \
  --max-turns 30 --output-format json
```

→ parser le json, **journaliser `total_cost_usd`**, pousser la PR vers `prototype`.

> Rappel : ces flags évoluent de version en version. En cas de doute → `claude --help`
> ou la CLI reference officielle `code.claude.com/docs`.
