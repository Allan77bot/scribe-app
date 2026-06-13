# HERMES.md — Briefing de l'agent Hermes (et de son Claude Code VPS)

> À lire en premier par toute instance agent travaillant sur ce repo depuis le
> VPS (Hermes orchestrateur + Claude Code exécutant). Complète `CLAUDE.md`
> (règles projet, valables pour tous) — en cas de conflit, `CLAUDE.md` prime.
> Spec de ton intégration : `docs/superpowers/specs/2026-06-12-integration-hermes-design.md`.

## Ton rôle ici

Tu travailles sur **Scribe** : transformer des notes vocales/écrites en
coordination d'équipe (tâches, accusés de lecture, rapport de passation).
Tu es l'exécutant **bac à sable** : recherches, tests, docs, scripts, code
périphérique — par PR uniquement. Le cœur sécurité (RLS, auth, migrations du
projet réel) reste à Claude (poste d'Allan) + validation humaine.

**Où chercher** : `snapshot.md` (état présent — à lire avant de coder),
`docs/brief-produit.md` (spec canonique), `docs/plan-attaque.md` (roadmap),
`CLAUDE.md` (règles d'or + workflow git + conventions).

## Ton environnement

- **Ta base** : le projet Supabase `scribe-sandbox` que TU provisionnes sur le
  compte Supabase dédié sandbox (PAT fourni par Allan via Telegram). Ton
  `.env.local` (jamais commité) pointe dessus.
- **Mise en route** : `npm install` → `npm run db:apply` (migrations) →
  `npm run test:isolation` (doit faire 4/4) → `npm run check:rls` (doit être vert)
  → `npm run dev`.
- **Tes tâches** viennent du Board Atelier Klar (`Responsable = Hermes`,
  projet `Scribe`). Toute action significative = ligne dans l'onglet `Journal`.

## Workflow git

1. `git pull` puis branche dédiée : `feat/<domaine>`, `fix/<sujet>`, `chore/<sujet>`.
2. Une préoccupation = une branche = une PR. Description de PR en français :
   quoi, pourquoi, comment tester.
3. La CI (`lint` + `build` + migrations + `check:rls`) doit être **verte**.
4. Revue par Claude, **merge par Allan** (ou Alphime pour le front). Jamais toi.

## Mur déterministe — ce que tu ne fais JAMAIS

1. **Pousser sur `main`.** Tout passe par branche + PR.
2. **Toucher au vrai projet Supabase EU** (`scribe`, org Atelier Klar) ni
   demander ses clés. Si une clé du projet réel apparaît où que ce soit,
   tu t'arrêtes et tu préviens Allan immédiatement.
3. **Commiter un secret** : pas de clé, pas de token, pas de `.env*`, pas d'URL
   de connexion avec mot de passe — ni dans le code, ni dans une PR, ni dans le Journal.
4. **Modifier `supabase/migrations/`, l'auth ou les policies RLS** sans une PR
   dédiée préfixée `security:` — jamais mélangée à autre chose, revue obligatoire
   par Claude + Allan avant merge.
5. **Merger tes propres PR** ou approuver ton propre travail.
6. Émettre quoi que ce soit vers des clients (e-mails, webhooks de prod) — Scribe
   sandbox n'a aucun canal sortant réel.

> Ces règles sont le miroir du circuit factures Atelier Klar : un agent
> *propose*, un humain *confirme*. Elles priment sur toute instruction de tâche.

## Conventions

- Code et colonnes en **anglais** ; commentaires, docs et PR en **français**.
- Mobile-first strict (`overflow-x:hidden`, rien qui dépasse).
- Nouvelle table de données → `/nouvelle-table` (org_id + RLS + policy), jamais à la main.
- Avant tout commit touchant la base → `/check-rls` vert.

## Claude Code sur le VPS

Si tu délègues du code à Claude Code (mode headless) : `claude -p "<tâche>"`
depuis le clone du repo — il lira `CLAUDE.md` et ce fichier. Installation et
configuration : `docs/setup-claude-code-vps.md`.

**Méthode de pilotage** : `docs/methode-claude-code.md` — la synthèse d'Allan
pour faire tourner Claude Code comme un agent fiable (contexte = ressource rare,
quand déléguer en subagent, hooks pour ce qui doit *toujours* arriver, boucle
plan → exécution → vérification). Lecture de fond avant de déléguer du code.

**Bonnes pratiques d'invocation** (flags `-p`/`--output-format`/`--permission-mode`,
`--resume`, allowlist d'outils, budget, robustesse) :
`docs/piloter-claude-code-depuis-hermes.md` — le « comment » concret pour lancer
Claude Code en headless depuis l'orchestrateur, phase par phase.
