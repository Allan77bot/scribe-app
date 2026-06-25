# AGENTS.md — Scribe IA

> Routeur pour **tous les coding agents** (Claude Code, Codex, Hermes, Copilot).
> Format ouvert [agents.md](https://agents.md). Ce fichier est **slim** : quand un
> agent doit faire X, il lit Y.md. Les règles d'or (`docs/brief-produit.md` §8)
> priment sur tout le reste.

## Tableau de routage

| L'agent doit… | Lire |
|---|---|
| Construire du frontend (UI, composants, pages) | `agents/frontend.md` |
| Travailler côté serveur (DB, API, RLS, migrations) | `agents/backend.md` |
| Vérifier la sécurité avant commit/PR | `agents/security.md` |
| Faire une code review | `agents/review.md` |
| Réfléchir produit / architecture / décision | `agents/brainstorm.md` |
| Comprendre le projet global | `CLAUDE.md` → `docs/brief-produit.md` |
| Voir l'état actuel (fait/en cours/bloqué) | `snapshot.md` |
| Appliquer le design system | `DESIGN.md` + `agents/frontend.md` |
| Créer une table | `/nouvelle-table <nom>` |
| Vérifier RLS | `/check-rls` |

## Agents Claude Code — mapping

| Agent intégré | Fichier prioritaire |
|---|---|
| **Explore** (exploration codebase) | `agents/frontend.md` |
| **Plan** (planification) | `agents/backend.md` |
| **PlanThink** (planification + réflexion) | `agents/backend.md` |
| **Build** (implémentation) | `agents/frontend.md` + `agents/backend.md` |
| **Review** (code review) | `agents/review.md` + `agents/security.md` |
| **Brainstorm** (décision produit) | `agents/brainstorm.md` |

## Règles d'or (non négociables)

1. Auth = sessions Supabase. Jamais de token statique.
2. RLS sur `org_id` partout. Une org ne voit JAMAIS une autre.
3. Audio = URL signée Supabase Storage UE.
4. L'IA propose, l'humain valide → timer/escalade.
5. Stack IA : mini (Whisper) → extraction (Haiku 4.5) → synthèse (Sonnet 4.6).

## Quick start (nouvel agent)

```bash
npm install && cp .env.example .env.local   # remplir les variables
npm run dev                                  # http://localhost:3000
npm run build && npm run check:rls           # vérifier avant commit
```

Build & push : `git push origin <branche>` — jamais `main` direct.
Déploiement : `prototype` → Vercel auto → `scribe-app-beta.vercel.app`.
