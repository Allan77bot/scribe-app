# Méthode Claude Code — Piloter un agent autonome

> Document de référence personnel. Synthèse structurée de mes apprentissages Claude Code,
> orientée vers un seul objectif : faire fonctionner Claude Code comme un **agent autonome
> fiable**, pas comme un autocomplete bavard.
>
> *Note : l'outil évolue vite. L'architecture (CLAUDE.md, skills, subagents, hooks, MCP,
> plugins) est stable ; la syntaxe exacte de certaines commandes change de version en version.
> En cas de doute, taper `/help` ou consulter https://docs.claude.com/en/docs/claude-code/overview.*

---

## 0. Le modèle mental

Une seule idée gouverne tout le reste :

> **La performance d'un agent = la qualité de son contexte.**

Claude Code n'est pas limité par son intelligence mais par ce qu'on lui met dans la tête au bon
moment. Tout l'outillage (mémoire, skills, subagents, hooks, plugins) sert à une seule chose :
**mettre la bonne information au bon endroit, et rien de plus.**

Trois réflexes qui découlent de ça :

1. **Donner peu, mais juste** — chaque fichier, MCP ou instruction inutile dégrade la réponse.
2. **Déléguer ce qui pollue** — la recherche, l'exploration, les tâches répétitives partent en
   subagents pour ne pas saturer le contexte principal.
3. **Rendre déterministe ce qui doit l'être** — ce qui doit *toujours* s'exécuter passe par un
   hook, pas par un prompt qu'on espère voir respecté.

---

## 1. La règle d'or : le contexte est la ressource rare

### Le piège « lost in the middle »
Dans un long prompt ou un long contexte, le modèle traite très bien le **début** et la **fin**,
mais survole le **milieu**. Conséquences pratiques :

- Mettre l'instruction critique **au début ou à la fin**, jamais noyée au centre.
- **Découper** une grosse consigne en 4-5 prompts distincts plutôt qu'un pavé unique.
- Technique du *prompt discovery* : un premier message court qui dit « lis attentivement la
  prochaine instruction », puis l'instruction détaillée juste après.

### Gérer le budget de contexte
| Commande | Quand l'utiliser | Effet |
|---|---|---|
| `/context` | Quand la session ralentit ou devient confuse | Montre ce qui consomme le contexte (gros fichiers, MCP, CLAUDE.md…) |
| `/compact` | Vers **50-70 %** de remplissage | Résume la conversation, libère de la mémoire, prolonge la session |
| `/clear` | Nouveau sujet / nouvelle mission | Repart à zéro, évite de mélanger les tâches |
| `/rewind` | Mauvaise direction prise | Revient à un message antérieur sans ouvrir une nouvelle session |

**Principe « une tâche = une conversation ».** Un gros sujet → une session dédiée. On ne mélange
pas deux missions dans le même chat : Claude reste concentré, le contexte reste propre.

---

## 2. Les briques de l'agent (taxonomie)

C'est le tableau le plus important du document : savoir **quelle brique pour quel problème**.

| Brique | C'est quoi | Quand l'utiliser | Où ça vit |
|---|---|---|---|
| **CLAUDE.md** | La « constitution » du projet, lue à chaque session | Toujours. Conventions, structure, commandes du projet | Racine projet / `~/.claude/` / sous-dossiers |
| **Skill** | Un workflow réutilisable, appelé par `/nom` ou auto-déclenché | Un process qui marche → on le fige pour le rejouer | `.claude/skills/<nom>/SKILL.md` |
| **Subagent** | Une session Claude séparée, contexte isolé | Recherche, exploration, parallélisme, tâches « jetables » | `.claude/agents/` |
| **Hook** | Un script déterministe sur un événement | Ce qui doit **toujours** s'exécuter (lint, garde-fou, notif) | Config `.claude/` |
| **MCP** | Connexion à un outil externe (GitHub, DB, navigateur…) | Quand il faut agir hors du repo | `claude mcp add …` |
| **Plugin** | Bundle versionné (skills + agents + hooks + MCP) | Pour distribuer / partager un setup complet | `/plugin` |
| **Status line** | Tableau de bord en bas du terminal | Surveiller modèle, contexte, tokens, coût, branche Git | `/statusline` |

> **Note 2026 :** les anciennes « commandes » (`.claude/commands/`) ont fusionné dans le système
> de **skills**. L'ancien dossier marche encore (legacy), mais l'emplacement canonique est
> `.claude/skills/`. Si un skill et une commande portent le même nom, **le skill gagne**.

---

## 3. La mémoire — CLAUDE.md

Le fichier le plus rentable de tout le système. Lu **à chaque session**, il évite de tout
réexpliquer.

### Les 3 niveaux
- **Global** (`~/.claude/CLAUDE.md`) — qui je suis, comment je veux qu'on me parle, mes
  conventions transverses. *Ex : « parle-moi comme à quelqu'un qui débute en code, explique ce
  que tu fais », « je suis vibe-coder ».*
- **Projet** (racine du repo) — structure, stack, commandes, règles du projet. Chargé
  automatiquement avant chaque conversation.
- **Sous-dossier** — règles locales, lues seulement quand l'agent entre dans ce dossier (utile
  pour des règles spécifiques front / back / API).

### Les bonnes pratiques
- **`/init`** crée ou met à jour le CLAUDE.md d'un projet (il scanne fichiers, outils, structure).
  → Le **relancer en fin de session importante** pour garder la mémoire à jour.
- **Garder le fichier compact.** Pas de pavé inutile : chaque ligne consomme du contexte à
  chaque session.
- **Pattern « router ».** Un CLAUDE.md principal *court* qui renvoie vers des fichiers dédiés
  (`design.md`, `frontend.md`, `api.md`, `commands.md`). Claude ne lit que ce qui sert à la tâche.
- **`commands.md`** — toutes les commandes du projet (`npm run …`, scripts, etc.).
- **Journal d'erreurs.** Dès qu'une erreur revient, **l'écrire dans CLAUDE.md (ou le fichier
  référencé)** : « ne plus jamais faire X ». L'agent s'auto-corrige sur la durée.

---

## 4. Les compétences — Skills

Un skill = **un process qui marche, transformé en outil rejouable**. On enseigne un workflow une
fois, on l'appelle par son nom pour toujours.

### Fonctionnement
- Juste un dossier : `SKILL.md` (instructions) + fichiers de support optionnels (scripts, refs,
  templates PDF…). Un **index** intégré évite à Claude de tout lire d'un coup.
- **Deux modes d'invocation :**
  - **Manuel** — je tape `/nom-du-skill`, il s'exécute (comme les anciennes commandes).
  - **Auto** — Claude lit le champ `description` du skill et décide *lui-même* de le déclencher
    quand le contexte correspond. C'est ce qui en fait un vrai outil d'agent autonome.
- Pour les gros skills : plusieurs fichiers, chargés à la demande.

### Méthode
- Source de skills tout faits : **skills.sh** (installables en une commande).
- **Skill Creator** pour en fabriquer.
- **Meta-prompting** : un skill qui *crée d'autres prompts / skills / md*. Un prompt qui génère
  des prompts → on industrialise sa propre bibliothèque.
- **Soigner la `description`** : c'est elle qui déclenche l'auto-invocation. Cas d'usage clé en
  premier, formulation claire.

### Skill vs Subagent (la confusion classique)
- **Skill** = « insère ce process / ce template dans la conversation actuelle ». Même contexte.
- **Subagent** = « pars faire ça dans ta propre tête, reviens avec le résultat ». Contexte séparé.

---

## 5. La délégation — Subagents

Le levier n°1 pour l'autonomie **et** l'économie de tokens. Un subagent a **son propre contexte**,
ce qui isole le bruit du contexte principal.

### Quand déléguer
- **Recherche / exploration** — un subagent fouille la doc, le code, le web et ne ramène que la
  synthèse (le contexte principal ne voit pas les 50 fichiers parcourus).
- **Parallélisme** — plusieurs sous-tâches en même temps. *Ex : un subagent par page d'un site à
  traduire.*
- **Tâches simples sur petit modèle** — résumé, classement, nettoyage, recherche → confier à
  **Haiku** plutôt qu'à Opus. Même résultat, fraction du coût.

### En pratique
- `/agent` → *create new agent* → décrire le rôle (recherche, code, review, mini-modif…).
- Les subagents vivent dans `.claude/agents/`.
- Pour la recherche de doc à jour : coupler un subagent dédié avec **Context7** (voir §7).

---

## 6. L'automatisation déterministe — Hooks

Un hook = **un script qui s'exécute automatiquement sur un événement** du cycle de vie (avant une
action, après une édition, à la fin d'une tâche…).

Règle simple :

> **Tout ce qui doit *toujours* arriver passe par un hook, pas par un prompt.**
> Un prompt, Claude peut l'oublier. Un hook, non.

Usages typiques :
- **Garde-fous (`PreToolUse`)** — bloquer une commande Bash dangereuse, scanner un fichier avant
  écriture pour éviter d'exposer un secret. (Code de sortie 2 = refus, 0 = autorisé.)
- **Qualité** — lancer Prettier / un type-check automatiquement avant/après une édition.
- **Notifications** — sonnerie ou alerte desktop quand Claude a fini ou a besoin de moi → permet
  de **gérer plusieurs sessions en parallèle sans fixer l'écran**.

---

## 7. Les outils externes — MCP & alternatives

**MCP (Model Context Protocol)** connecte Claude à des services externes : GitHub, base de
données, navigateur, API internes. Le serveur gère l'intégration, Claude gère le raisonnement.

⚠️ **Attention au coût :** un MCP **prend beaucoup de place dans le contexte**, en permanence.

### Stratégie d'optimisation
- **Remplacer un MCP par un simple endpoint API** quand c'est possible : donner juste le point
  d'entrée utile au lieu de charger tout un MCP. Énorme économie de contexte.
- **Context7** — connecte Claude à la **doc API à jour** et ne récupère que la partie utile.
  Alternative plus légère et plus précise que les MCP pour la documentation (Stripe, Vercel,
  frameworks récents…). Évite que Claude code avec une vieille version de doc.
- **Exa** — websearch optimisé (payant), pour la recherche fine.

---

## 8. Orchestration — Workflows, Teams, Meta-prompting

Quand un projet dépasse une tâche unique, on passe de l'agent solo à **l'orchestration**.

### Workflow
Un **skill « workflow »** (ex. `/Code`) qui encode un **ordre logique** : analyse → exploration
(via subagents de recherche) → plan → exécution → vérification.
→ J'appelle `/Code "écris ta tâche"` et il déclenche **lui-même** les agents définis dans le
workflow, dans le bon ordre.

### Team Agent (équipes d'agents)
Plusieurs agents spécialisés qui collaborent comme une vraie équipe : développeur, designer,
product manager, reviewer… Orchestration définie dans un fichier `team`. Simule une équipe sur
une mission complète.

### Meta-prompting
Le niveau au-dessus : des prompts/skills qui **fabriquent d'autres prompts/skills**. C'est ce qui
permet de scaler sans tout écrire à la main.

---

## 9. Mode de travail — la boucle opérationnelle

C'est ici que se joue la différence entre « ça part dans le mur » et « ça livre juste ».

### Avant d'agir : planifier
- **Mode plan (`/plan`)** — demander à Claude de réfléchir, structurer les étapes et **proposer
  un plan avant de toucher au code**. Évite qu'il code vite dans la mauvaise direction.
- **Valider le plan** avant exécution : lire, corriger, puis laisser faire. Réduit les
  allers-retours.
- **Traiter Claude comme un dev junior compétent** : le laisser proposer *sa* solution plutôt que
  d'imposer la mienne. Il trouve souvent mieux.
- **Forcer le questionnement** — prompt clé :
  > *« Pose-moi des questions jusqu'à être sûr à 95 % de ce que tu dois faire. »*
  - Demander un format **QCM** pour répondre vite sans tout retaper.

### Pendant : raisonnement profond
- **`ultrathink`** dans un prompt → active un raisonnement plus poussé. Pour l'architecture
  complexe, un gros bug, un refactor, un choix technique structurant.
- *(Noté à vérifier selon version : `ultracode` / `ultracode ON` — mode multi-agents + génération
  de scripts sur une tâche. Confirmer la syntaxe exacte avec `/help`.)*

### Pendant : reprendre la main
- **`Ctrl + C`** — interrompre dès qu'il part dans la mauvaise direction. On ne gaspille pas
  temps/tokens.
- **Corriger sans interrompre** — envoyer une nouvelle instruction en cours de route pour
  réaligner sans repartir de zéro.
- **`/rewind`** — revenir à un message antérieur et effacer la suite.

### Après : vérifier et challenger
- **Auto-vérification** — lui demander de vérifier que son travail correspond bien à la todo et
  aux attentes. Réduit bugs et oublis.
- **Challenger le résultat** — *« Ce n'est pas assez bon. Refais mieux, voici pourquoi. »* Le 2ᵉ
  jet est presque toujours nettement meilleur.

### Toujours
- **Contexte minimal** — ne donner que les fichiers / extraits réellement nécessaires.
- **Screenshots / images** — glisser une image dans le terminal (ou laisser Claude faire des
  captures) pour vérifier un design, une UI, une erreur visuelle.
- **Contrôle du navigateur** (extension / Playwright / Puppeteer) — Claude teste l'app lui-même
  en conditions réelles.

---

## 10. Vers l'autonomie 24/7

L'objectif final : un agent qui tourne **sans dépendre de mon écran**.

- **Worktrees (`--worktree`)** — lancer plusieurs sessions sur des **copies Git isolées**, chacune
  sur sa branche. Plusieurs features en parallèle, zéro conflit de fichiers.
- **`/loop`** — répéter automatiquement un prompt toutes les X minutes pendant une session
  (surveiller des logs, un site, une erreur récurrente).
- **Crons / tâches programmées** — pour le **permanent**, au-delà d'une session (Claude Code peut
  tourner en process « one-shot » sans terminal interactif : GitHub Action, jobs planifiés,
  pre-commit…).
- **Serveur cloud / AIOS** — installer Claude Code sur un serveur connecté à mes outils, fichiers
  et canaux (Telegram, Slack…). Il travaille H24 sans mon PC.
- **Remote Control** — piloter / superviser une session **depuis le téléphone**, avec
  notifications push quand l'agent a besoin de moi.

---

## 11. Sécurité & garde-fous

L'autonomie sans garde-fous = risque. À cadrer dès le départ.

- **`--dangerously-skip-permissions`** — désactive les demandes de validation avant actions
  sensibles. Gain de temps réel, **mais uniquement dans un environnement sécurisé/jetable**.
- **Allowlist de commandes** — *bien préférable* : autoriser seulement certaines commandes plutôt
  que tout débloquer. Sécurité + fluidité.
- **Hooks `PreToolUse`** — le filet de sécurité déterministe : vétos sur les patterns Bash
  dangereux, scan de secrets avant écriture.
- **`--safe-mode`** — session propre, toutes customisations désactivées, pour diagnostiquer un
  comportement anormal.

---

## 12. Antisèche — commandes & raccourcis

### Saisie & navigation
| Touche / symbole | Action |
|---|---|
| `?` ou `/` | Voir toutes les commandes disponibles |
| `@fichier` | Tagger un fichier dans le prompt |
| `!` | Mode Bash (commandes terminal : npm, pnpm…) |
| `Tab` | Changer de mode |
| `Esc Esc` | Effacer le texte / (double) retrouver un ancien message |
| `Ctrl + T` | Tâches |
| `Ctrl + O` | Retour à l'écriture |
| `Ctrl + S` | Sauvegarder mon prompt |
| `Ctrl + C` | Interrompre Claude |

### Commandes slash
| Commande | Action |
|---|---|
| `/init` | Créer / mettre à jour le `CLAUDE.md` du projet |
| `/config` | Configurer les réponses |
| `/usage` | Voir l'usage |
| `/model` | Choisir le modèle (Opus = défaut agentique, Haiku = tâches simples…) |
| `/agent` | Créer un subagent |
| `/plan` | Mode planification |
| `/context` | Analyser la consommation de contexte |
| `/compact` | Résumer la conversation (libérer du contexte) |
| `/clear` | Nettoyer le chat / nouvelle session |
| `/rewind` | Revenir à un message antérieur |
| `/statusline` | Tableau de bord (modèle, contexte, tokens, coût, branche) |
| `/hooks` | Gérer les hooks (notifications…) |
| `/voice` | Dicter ses prompts à la voix |
| `/plugin` | Installer / gérer les plugins |

> **Productivité transverse :** un outil de **dictée vocale** (type WisprFlow) accélère *tout* le
> workflow — pas seulement Claude Code, mais aussi mails, specs, doc, idées.

---

## 13. Plugins — étendre proprement

Un plugin = **bundle versionné** qui embarque d'un coup skills + subagents + hooks + status line +
définitions MCP. C'est la façon canonique de **partager un setup complet** (équipe, marketplace).

- **N'utiliser que des plugins officiels / de confiance** pour éviter les hacks (pas de contrôle
  ni de modif possible sur le contenu d'un plugin tiers).
- Mieux : **s'inspirer** d'un plugin et **recréer mes propres commandes/skills** à partir de là.
  Plus sûr et adapté à mon besoin.

---

## 14. Starter kit — mise en place d'un agent autonome

Checklist d'amorçage pour un nouveau projet (poser les fondations *avant* de foncer en exécution) :

1. **`CLAUDE.md` global** (`~/.claude/`) — qui je suis, ton souhaité, conventions transverses.
2. **`/init`** dans le projet → CLAUDE.md projet de base, puis le **rendre compact** + pattern
   *router* vers `commands.md`, `frontend.md`, etc.
3. **Skills de base** — figer mes 2-3 process récurrents en skills (`/nom`), description soignée
   pour l'auto-invocation.
4. **Subagents** — au moins un agent *recherche* (couplé Context7) et un agent *review*.
5. **Hooks** — un garde-fou `PreToolUse` + une notification de fin de tâche.
6. **MCP / API** — connecter le strict nécessaire ; préférer un endpoint API à un MCP lourd.
7. **Status line** active pour surveiller contexte & coût.
8. **Boucle de travail** verrouillée : `/plan` → valider → exécuter → auto-vérif → challenger.
9. **Journal d'erreurs** : chaque erreur récurrente → consignée dans CLAUDE.md.
10. Quand stable → **plugin** pour packager et **transmettre** le setup (à un collaborateur, à un
    autre projet).

---

### En une phrase
> Un bon CLAUDE.md, des skills qui figent mes process, des subagents qui isolent le bruit, des
> hooks pour ce qui doit toujours arriver, un contexte minimal — et une boucle plan → exécution →
> vérification que je ne saute jamais.
