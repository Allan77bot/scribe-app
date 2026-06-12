# Spec — Intégration d'Hermes au projet Scribe

> Design validé par Allan le 2026-06-12. Définit comment l'agent autonome Hermes
> (Atelier Klar) rejoint le projet Scribe en bac à sable, sans jamais toucher au
> cœur sécuritaire (RLS / isolation par org / vrai projet Supabase EU).
> Contexte Hermes : `tests/projethermes.md` (briefing Atelier Klar).

## 1. Objectif

Permettre à Hermes (agent autonome NousResearch, Docker sur le VPS Hostinger
d'Allan, modèle DeepSeek, piloté par Telegram + Board Google Sheets) de
travailler sur Scribe de manière autonome — recherches, tests, code périphérique,
provisioning de son propre environnement — pendant qu'Allan et Alphime restent
concentrés sur leurs clients. Allan pilote depuis son téléphone.

**Principe directeur** : Hermes a *sa propre copie* de l'environnement. Il peut
tout y faire, tout casser, recommencer. Ce qui est bon remonte par PR validée
par un humain. L'IA propose, l'humain confirme (règle d'or n°4 du projet).

## 2. Partage des rôles

| Acteur | Rôle dans Scribe |
|---|---|
| ♦ Allan | Valide les PR et les décisions. Pilote Hermes par Telegram/Board. |
| ♠ Alphime | Front, design, UX — inchangé. Revue croisée du schéma. |
| ♥ Claude (Claude Code, poste d'Allan) | Cœur back-end : base, RLS, pipeline IA, revue des PR d'Hermes. |
| ♣ Hermes | Bac à sable autonome : provisioning sandbox, tests, recherches, docs, scripts, code périphérique — **uniquement par PR**. |

## 3. Architecture de l'intégration

### 3.1 Repo GitHub

- Push du repo local en **privé** sous le compte `Allan77bot`, nom : **`scribe-app`**.
- Branches poussées : `main` + `feat/auth` (+ branches futures).
- **Protection de `main`** : merge uniquement par PR, push direct interdit,
  force-push interdit. (Même règle que le cockpit `atelierklar-board`.)
- Accès d'Hermes : **PAT fine-grained** créé par Allan, limité au seul repo
  `scribe-app`, permissions **Contents (read/write) + Pull Requests (read/write)**.
  Rien d'autre (pas d'admin, pas de secrets, pas d'actions).

### 3.2 Sandbox Supabase (containment)

- Un token Supabase (PAT) donne accès à **tout le compte** qui l'émet. Pour
  qu'Hermes soit autonome sans voir le vrai projet `scribe` EU :
  le PAT vient d'un **compte Supabase dédié** (`contact@atelierklar.fr`, plan gratuit).
- Hermes provisionne lui-même son projet **`scribe-sandbox`** (région EU),
  applique les migrations (`npm run db:apply`), prouve l'isolation
  (`npm run test:isolation` → 4/4) et lance `npm run check:rls`.
- Hermes gère son propre `.env.local` sur le VPS (jamais commité).
- **Les clés du vrai projet EU (`kgbxxzujlubflsvprmef`) ne sont JAMAIS
  transmises à Hermes.** Ni l'URL, ni l'anon key, ni la service_role.

### 3.3 Briefing agent : `HERMES.md` (racine du repo)

Miroir du `CLAUDE.md` mais pour Hermes. Contenu :

1. **Rôle et contexte** : mission Scribe (coordination d'équipe, pas transcription),
   où chercher (snapshot, brief produit, plan d'attaque).
2. **Comment travailler** : cloner, brancher (`feat/…` ou `chore/…`), commit,
   PR avec description en français ; commandes du projet (`npm run dev`,
   `build`, `lint`, `check:rls`, `test:isolation`, `db:apply`).
3. **Mur déterministe — ce qu'Hermes ne fait JAMAIS** :
   - push direct sur `main` (bloqué techniquement de toute façon) ;
   - toucher au vrai projet Supabase EU ou demander ses clés ;
   - commiter un secret, une clé, un `.env*` ;
   - modifier migrations / RLS / auth sans PR explicitement marquée
     `security-review` et revue par Claude + Allan ;
   - merger ses propres PR.
4. **Traçabilité** : toute tâche vient du Board (Responsable = Hermes), toute
   action significative = ligne dans l'onglet `Journal` du Board.

### 3.4 Garde-fou déterministe : CI GitHub Actions

Workflow `.github/workflows/ci.yml` déclenché sur chaque PR :

- `npm ci` → `npm run lint` → `npm run build` → `npm run check:rls`.
- CI rouge = merge impossible (required status check sur `main`).
- But : la règle d'or RLS n'est pas une consigne qu'un agent doit « penser à
  suivre » — c'est un mur mécanique, dans l'esprit du circuit factures Atelier Klar.
- Note : `check:rls` en CI doit pouvoir tourner sans secrets du vrai projet
  (audit statique des migrations, ou variables pointant le sandbox — à trancher
  au plan d'implémentation ; en aucun cas les clés EU dans les secrets GitHub).

### 3.5 Pilotage : Board Atelier Klar

- Le Board existant (Sheet `1vNpZG4gtbxu2YeINNKl9E7MikJEKiY0nSEp4rvDRj60`)
  reste la **source unique des tâches** : on ajoute le projet « Scribe »
  (onglet `Projets`) et des cartes `Responsable = Hermes`.
- Premières cartes (dans l'ordre) :
  1. Cloner `scribe-app`, lire `HERMES.md`, accuser réception sur Telegram.
  2. Provisionner `scribe-sandbox` (compte dédié), appliquer les migrations.
  3. Prouver l'isolation : `test:isolation` 4/4 + `check:rls` vert → rapport Journal.
  4. Recherche : SMTP transactionnel pour la confirmation e-mail Supabase
     (comparatif coût/EU/simplicité, recommandation argumentée).
  5. Recherche : transcription OpenAI direct vs Azure OpenAI EU (décision
     ouverte avant `feat/pipeline`).
- Allan assigne/valide depuis Telegram, comme pour la prospection.

### 3.6 Claude Code sur le VPS — l'exécutant code d'Hermes

Hermes dispose de **Claude Code installé sur le VPS** (abonnement, Fable 5) et
l'utilisera en **mode bypass permissions** pour travailler sans interruption.
Architecture : Hermes = orchestrateur (reçoit les tâches du Board, découpe,
journalise) ; Claude Code VPS = exécutant code (clone, code, teste, ouvre les PR).

**Le mode bypass n'est acceptable QUE parce que trois murs l'encadrent** :

1. **Sandbox total** : le VPS ne détient que les clés du compte Supabase
   sandbox dédié — il n'y a littéralement rien de réel à casser.
2. **Protection de `main`** : push direct impossible, tout passe par PR.
3. **CI obligatoire** : lint + build + check:rls verts avant tout merge.

Conséquence durcie : **aucune clé du vrai projet EU ne doit jamais exister sur
le VPS**, ni dans un `.env`, ni dans un message Telegram, ni dans l'historique.

Pour que l'instance VPS travaille « comme Claude ici », le repo doit être
**auto-suffisant** :

- `CLAUDE.md` (déjà versionné) : règles d'or, workflow git, conventions.
- `.claude/commands/` (déjà versionné) : `/check-rls`, `/nouvelle-table`.
- `HERMES.md` (§3.3) : lu aussi par l'instance Claude Code VPS.
- **Nouveau livrable** : `docs/setup-claude-code-vps.md` — installation,
  login, plugins à installer (Superpowers…), invocation headless par Hermes
  (`claude -p "<tâche>"`), et les flags du mode bypass.

**Routage par complexité** (Allan définit les scopes — convention proposée) :
chaque carte Board porte une complexité ; Hermes route en conséquence.

| Complexité | Exécutant |
|---|---|
| Recherche, veille, Sheets, scraping | Hermes seul (DeepSeek) |
| Code, tests, migrations sandbox, PR | Claude Code VPS (Fable 5) piloté par Hermes |
| Cœur RLS/auth/sécurité | Claude poste d'Allan + validation humaine — jamais le VPS |

### 3.7 Boucle de validation des PR

```
Hermes ouvre une PR → CI verte obligatoire → revue par Claude (code review)
→ merge par Allan (ou Alphime pour le front). Jamais d'auto-merge.
```

## 4. Ce qui est transmis à Hermes (par Allan, via Telegram)

| Élément | Source |
|---|---|
| URL du repo `Allan77bot/scribe-app` | après push |
| PAT GitHub fine-grained (repo seul, Contents + PR) | créé par Allan |
| PAT Supabase du **compte sandbox dédié** | créé par Allan sur `contact@atelierklar.fr` |
| Message de briefing (rédigé par Claude, prêt à coller) | livrable de ce projet |

## 5. Livrables (côté Claude)

1. Push du repo `scribe-app` (privé, `Allan77bot`) + protection de `main`.
2. `HERMES.md` à la racine (contenu §3.3).
3. Workflow CI `.github/workflows/ci.yml` (§3.4) + required status check.
4. `docs/setup-claude-code-vps.md` : guide d'installation/config de Claude Code
   sur le VPS pour Hermes (plugins, login, mode headless/bypass).
5. Message de briefing Telegram prêt à coller (avec checklist de ce qu'Allan transmet).
6. Cartes Board rédigées (texte prêt à coller, ou écriture directe si `gws`
   accessible depuis ce poste).
7. Mise à jour `snapshot.md` + entrée `historique.md` (discipline de fin de session).

## 6. Hors périmètre (explicite)

- Hermes ne reprend **pas** le cœur base/RLS/auth : il reste à Claude + Allan.
- Pas d'accès SSH de Claude au VPS : la config côté Hermes passe par Allan/Telegram.
- La PR croisée `feat/auth` (validation du schéma par Alphime) reste un jalon
  humain, indépendant d'Hermes — le push GitHub la rend simplement possible.
- Pas de modification du fonctionnement actuel d'Hermes (prospection 9h, etc.).

## 7. Critères de succès

- [ ] Hermes a cloné le repo et accusé réception du briefing.
- [ ] `scribe-sandbox` provisionné par Hermes, migrations appliquées,
      isolation prouvée 4/4, `check:rls` vert — rapporté dans le Journal.
- [ ] Première PR d'Hermes ouverte, CI verte, relue, mergée par Allan.
- [ ] Aucune clé du vrai projet EU n'a transité vers Hermes ou GitHub.
- [ ] Allan pilote l'ensemble depuis Telegram sans ouvrir l'ordinateur,
      sauf pour merger.

## 8. Risques et parades

| Risque | Parade |
|---|---|
| Hermes ou Claude Code VPS commet une erreur de sécurité dans le code | CI obligatoire + revue Claude + merge humain uniquement |
| Claude Code VPS en bypass fait n'importe quoi sur le serveur | il ne détient que des clés sandbox + PAT minimal ; rien de réel n'est atteignable |
| Fuite du PAT GitHub | fine-grained, un seul repo, permissions minimales, révocable |
| Fuite du PAT Supabase | compte dédié sandbox : ne contient rien de réel |
| Secret commité par erreur | `.gitignore` déjà en place + revue + (option plan : scan de secrets en CI) |
| Dérive « Hermes touche au cœur » | mur déterministe dans `HERMES.md` + label `security-review` + protection `main` |
