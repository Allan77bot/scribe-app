# Scribe — Agent Instructions

> Format ouvert AGENTS.md (compatible Claude Code, Codex, Hermes Agent).
> Complémentaire à CLAUDE.md, plus orienté "comment bosser" que "quoi lire".

## Build & Run
```bash
npm install           # Dépendances
npm run dev           # Dev server (localhost:3000)
npm run build         # Build production
npm run lint          # ESLint
npx tsc --noEmit     # TypeScript check
npm run check:rls     # Vérifie RLS sur tables Supabase
```

## Test
```bash
# Tests end-to-end (Playwright)
npx playwright test

# Tests unitaires (Vitest)
npx vitest run
```

## Database
- **Sandbox** : `doorjfxqetoawqnvguvz` (EU)
- **Connexion** : `aws-0-eu-west-3.pooler.supabase.com:6543`
- **Migrations** : appliquées via `/api/admin/migrate` (POST, header `x-admin-key`)
- **Nouvelle table** : `/nouvelle-table <nom>` (génère migration + RLS + policies)
- **Check RLS** : `/check-rls` → doit être vert avant chaque commit

## Stack
- **Frontend** : Next.js 16 (App Router, Turbopack), Tailwind CSS v4, TypeScript
- **Backend** : Supabase (PostgreSQL + RLS), Stripe (billing), Brevo (emails), OpenAI (transcription), Anthropic (extraction)
- **Design** : DESIGN.md (Professional Flow, Manrope, light theme)

## Conventions
- **Code** : anglais (variables, fonctions, colonnes DB)
- **Commentaires** : français
- **Mobile-first** strict
- **Git** : branche `prototype`, jamais `main`. Nommage `feat/`, `fix/`, `chore/`, `docs/`
- **RLS** : org_id sur chaque table, isolation stricte par organisation
- **Pas de token statique** comme auth — sessions Supabase uniquement

## Skills actifs
- `/frontend-design` — design UI/UX Anthropic
- `/vercel-react-best-practices` — patterns Next.js Vercel
- `/supabase-postgres-best-practices` — RLS, index, requêtes
- `/security-requirement-extraction` — audit sécu
- Superpowers v5.1.0 — 14 skills (TDD, debug, code review, plans, subagents, etc.)
- `/nouvelle-table` — migration table + RLS
- `/check-rls` — vérification RLS

## Règles d'or (rappel)
1. Auth par session Supabase, pas de token statique
2. RLS `org_id` partout — une org ne voit jamais les données d'une autre
3. Audio uploadé par URL signée Supabase Storage
4. Validation humaine avant qu'une tâche déclenche une action
5. Stack IA hybride : mini pour extraire, moyen pour synthèse

## Liens
- Production : https://scribe-app-beta.vercel.app
- Supabase : https://supabase.com/dashboard/project/doorjfxqetoawqnvguvz
- GitHub : https://github.com/Allan77bot/scribe-app
