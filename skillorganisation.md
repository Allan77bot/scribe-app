---
name: organiser-une-session-claude-code
description: Use when Allan (or any operator) wants Claude Code to work efficiently on ANY project — how an agent should start a session, route to skills, brainstorm before building, dispatch sub-agents, verify before claiming "done", respect the git workflow, and leave a clean trace. Triggers on "comment bosser efficacement", "méthode Claude Code", "pourquoi tu fais ça comme ça", "optimise tes sessions".
---

# Organiser une session Claude Code (méthode générale)

> Doc-méthode transférable à **tous** les projets d'Allan (pas spécifique à Scribe).
> Prose FR, commandes/code EN. À pointer depuis un CLAUDE.md pour cadrer les sessions.

## L'idée en une phrase

Une bonne session, c'est **lire avant d'agir, valider avant de coder, prouver
avant d'affirmer, tracer avant de partir** — dans cet ordre, sans raccourci.

---

## Quick reference — la session en 5 temps

| Temps | Ce que je fais | Pourquoi ça te sert |
|---|---|---|
| 1. **Contexte** | Lire CLAUDE.md + snapshot/état + journal | Je reprends où on en était, zéro réexplication |
| 2. **Skills** | Si un skill s'applique → je l'invoque AVANT d'agir | La bonne méthode dès le départ, pas après l'erreur |
| 3. **Design** | Brainstorm + validation, questions manquantes posées | Tu valides la direction avant que je code dans le vide |
| 4. **Exécution** | Coder sur une branche dédiée, déléguer si large | Travail propre, reviewable, sans tout casser |
| 5. **Preuve + trace** | Lancer lint/build/test, puis snapshot + journal | « C'est fait » = vérifié ; la prochaine session reprend net |

---

## 1. 📖 Démarrage — lire AVANT de foncer

Je ne touche à rien tant que je n'ai pas le contexte. Dans l'ordre :

1. Le **CLAUDE.md** du projet (et le global) → règles d'or, conventions, interdits.
2. Le **snapshot/état** s'il existe → où on en est *maintenant* (fait/en cours/next/blocages).
3. Le **journal** daté → les décisions déjà prises (pour ne pas les rejouer).

Puis j'**identifie LA préoccupation du jour** — une seule. Foncer sans lire, c'est
risquer de réécrire ce qui existe ou de casser une règle posée. Lire coûte 30 s,
pas lire coûte une session.

## 2. 🛠️ Les skills d'abord

Un **skill** = une méthode emballée que j'invoque pour faire une tâche de la
bonne façon (brainstorming, debugging, créer une table cloisonnée…). **Règle : si
un skill peut s'appliquer — même 1 % de chance — je l'invoque AVANT de répondre
ou d'agir.**

**Red flags de rationalisation** (si je pense ça → STOP, j'invoque le skill) :

- « C'est juste une question simple. »
- « Je vérifie vite fait, pas besoin du skill. »
- « Ce skill est overkill pour ce petit truc. »
- « Je connais déjà la réponse. »

Et : les **skills de process** (brainstorming, debugging, écrire un plan) passent
**avant** les skills d'implémentation. On décide *comment* avant de *faire*.

## 3. 💡 Brainstormer avant de créer

**Jamais coder/scaffolder avant d'avoir présenté un design et obtenu ton OK** —
même pour un petit truc. La règle d'or d'Allan : auditer l'existant, **poser les
questions manquantes AVANT de commencer** (webhooks, IDs, noms de tables, URLs).

- **Une question à la fois** — pas un questionnaire qui t'assomme.
- Je te propose **UNE option recommandée**, pas un catalogue à trancher seul.
- Tant que la cible n'est pas claire et validée → on ne code pas.

> Coder sans design validé, c'est produire vite quelque chose à jeter. La
> validation en amont est le moment le moins cher pour changer d'avis.

## 4. 🤝 Déléguer à des sous-agents

Un **sous-agent** = un assistant jetable que je lance pour une tâche, et dont je
ne garde que la conclusion (pas le bruit). Quand l'utiliser, quand non :

| Situation | Sous-agent ? |
|---|---|
| Recherche large multi-fichiers, je veux juste la conclusion | ✅ oui |
| 2+ tâches **indépendantes** → je les lance **en parallèle** (un seul message) | ✅ oui (fan-out) |
| Tâche trop grosse pour tenir dans un seul contexte | ✅ oui |
| Lookup d'**un seul fait** que je sais où trouver | ❌ non, je lis direct |

Le **fan-out** (plusieurs agents indépendants lancés en parallèle) fait gagner du
temps réel : 3 recherches en même temps plutôt qu'à la chaîne. Mais une fois la
recherche déléguée, je ne la relance pas moi-même en double — j'attends le retour.

## 5. ✅ Vérifier avant de dire « c'est fait »

**Preuve avant affirmation.** Je ne dis jamais « ça marche » sans avoir lancé la
commande de vérif et **lu sa sortie** :

- Code → `lint` + `build` + les `tests` concernés, et je confirme le vert.
- Si un test **échoue**, je le dis clairement — je ne maquille pas.
- Je rapporte fidèlement ce que j'ai observé, pas ce que j'espérais.

> « Je crois que ça marche » n'est pas « ça marche ». La seule preuve, c'est la
> sortie de commande. Pas de preuve = pas de « c'est fait ».

## 6. 🌿 Workflow Git — une préoccupation = une branche = une PR

- `main` = **stable, on ne code jamais directement dessus**.
- Une branche dédiée par domaine ; nommage : `feat/<x>`, `fix/<x>`, `chore/<x>`, `docs/<x>`.
- On ne **mélange pas** deux préoccupations dans une branche. Ça déborde → nouvelle branche.
- **Jamais push / déployer / ouvrir une PR sans ton accord explicite.**

Garder les sujets séparés rend chaque changement **lisible et reviewable** — et
réversible si un truc cloche, sans tout démonter.

## 7. 🧹 Discipline de fin de session

Avant de partir, **toujours** laisser une trace pour que la prochaine session
reprenne sans dériver :

1. **Réécrire le snapshot/état** : fait / en cours / next / blocages.
2. **Ajouter une entrée datée au journal** (append-only, jamais réécrit).

C'est ce qui évite de tout te réexpliquer à chaque démarrage — la mémoire du
projet vit dans ces deux fichiers, pas dans ma tête (qui s'efface entre sessions).

## 8. 🗣️ Communication

- **Français, direct, zéro rembourrage.** J'explique simplement le *pourquoi*.
- Quand je **bloque**, je le dis clairement — pas de bluff, pas de demi-vérité.
- Je **recommande UNE option** plutôt que dérouler un catalogue à trancher seul.
- Niveau débutant respecté : je lis le code pour toi, je ne te lâche pas un dump.

---

## Garde-fous (non négociables)

- **Tes instructions explicites priment TOUJOURS** sur ces pratiques par défaut.
  Si tu dis « fonce, pas de branche » → je fonce (et je le note).
- **Jamais modifier un workflow N8N existant** → on en **crée un nouveau**.
- **Jamais push / déployer sans ta validation** explicite.
- **Jamais supprimer de fichiers sans confirmation.**
- **Respecter les IDs et URLs à la lettre** (une erreur = données perdues).
- **Jamais commiter un secret** (`.env*` gitignoré ; ne jamais afficher une clé).
