---
name: apprendre-d-une-video
description: Use when Allan sends Hermes a message prefixed "A:" followed by a YouTube URL (A = Apprendre / Amélioration). Hermes routes the work to Claude Code (Opus 4.8) which watches the video via Gemini, extracts 1-3 transferable lessons, WRITES them into Mem0 (the agent's memory) tagged by domain, then RETURNS the lesson to Allan for human validation before it counts. Triggers on any message starting with "A:" + a YouTube link, or "apprends de cette vidéo", "retiens cette vidéo".
---

# Skill « A: » — Apprendre d'une vidéo et l'écrire dans Mem0

> Convention validée par Allan (juin 2026). Prose FR, code/commandes EN.
> Mémoire d'Hermes = **Mem0 cloud** (pas de fichiers .md). Voie Gemini testée OK.

## L'idée en une phrase

Un agent n'apprend pas en regardant — il apprend en **écrivant une leçon
réutilisable dans sa mémoire (Mem0)**, qu'il relit ensuite. Ce skill transforme
une vidéo en compétence durable, taguée par domaine, validée par un humain.

## Qui fait quoi (le cheat code)

Allan paie déjà Claude → le travail de qualité passe par Claude Code, coût en
plus = 0. Hermes ne fait qu'aiguiller.

| Rôle | Qui | Modèle |
|---|---|---|
| 🧭 Aiguilleur (reçoit `A:`, route) | Hermes | DeepSeek |
| 💪 Muscle (regarde, extrait, écrit dans Mem0) | **Claude Code** | **Opus 4.8** |
| 👁️ Les yeux (regarde la vidéo) | Gemini | gemini-3.5-flash |

## Permissions — qui peut déclencher « A: »

- **Allan** (Telegram `1374851322`) — décideur. **Seul autorisé** à déclencher
  `A:` (= tâche lourde de code). Valide les leçons.
- **Alphim / Shane** (Telegram `7533858975`) — crons, RDV, veille/actus. **Pas
  de code lourd.** S'il envoie `A:` → **escalader à Allan** avant d'exécuter.

**Avant exécution : vérifier que l'émetteur = Allan (`1374851322`).**

## Procédure (étape par étape)

1. **Détecter** un message qui commence par `A:` + une URL YouTube.
2. **Vérifier l'émetteur** (cf. Permissions). Si ce n'est pas Allan → escalader.
3. **Aiguiller** : Hermes dispatche la tâche à **Claude Code (Opus 4.8)** sur le VPS.
4. **Regarder la vidéo** via Gemini (recette ci-dessous). Vidéos **publiques** uniquement.
5. **Extraire 1 à 3 leçons** *transférables et actionnables* — pas un résumé.
6. **Détecter le domaine** (`marketing`, `ads`, `claude-code`, `saas`, …).
7. **Écrire chaque leçon dans Mem0** via `mem0.add()` sur `agent_id="hermes"`, avec
   le domaine et le statut en `metadata` (code ci-dessous).
8. **Renvoyer la fiche à Allan** sur Telegram : « Voici ce que j'ai retenu — je valide ? »
9. **Sur « ok »** : `mem0.update()` → `statut = "valide_allan"`. Sur « corrige X » : ajuster.
10. **Journaliser** l'action dans le Board (onglet Journal).

> **Règle d'or n°4** : une leçon n'est **active** (donc relue par le « dreaming »)
> que si `statut = "valide_allan"`. Sans validation, elle reste `propose`.

## Routage par domaine = un TAG Mem0 (pas un dossier)

Pas une armée d'agents (la vidéo le déconseille). UN seul Hermes ; le domaine est
un champ `metadata.domaine`. « Mettre la casquette marketing » = filtrer la
recherche sur ce tag :

```python
client.search("stratégie d'acquisition", agent_id="hermes",
              filters={"metadata": {"domaine": "marketing", "statut": "valide_allan"}})
```

Pour une **grosse tâche** ponctuelle, Claude Code peut lancer un **sous-agent
jetable** (le temps de la tâche), jamais un agent permanent.

## Le contenu d'une leçon (ce qu'on met dans Mem0)

Le **texte** du souvenir (champ `content`) suit ce gabarit ; le reste part en `metadata`.

```
[LEÇON] <titre court et parlant>
- Leçon : 1–2 phrases, l'idée transférable (pas le résumé).
- Quand l'appliquer : le déclencheur concret (« Quand je… », « Avant de… »).
- Comment : l'action précise, prête à l'emploi.
- Lien Scribe : comment ça touche le projet, ou « veille ».
```

`metadata` (les champs filtrables) :
`{ "type": "lecon", "domaine": "<...>", "source": "<url>", "date": "AAAA-MM-JJ", "statut": "propose|valide_allan|ecarte" }`

## Recettes (Gemini + Mem0)

Clés dans `.env.local` (gitignoré) : `GEMINI_API_KEY`, `MEM0_API_KEY`.

**1) Regarder la vidéo (Gemini)** — gratuit en preview, ≤ 8 h/jour, vidéos publiques :

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" -H 'Content-Type: application/json' -X POST \
  -d '{"contents":[{"parts":[
        {"text":"Analyse cette vidéo (audio + écran). Donne 1 à 3 LEÇONS transférables et actionnables (pas un résumé), et le DOMAINE principal (marketing/ads/claude-code/saas/...). Pour chaque leçon: quand l appliquer + comment."},
        {"file_data":{"file_uri":"<URL_YOUTUBE>"}}
      ]}]}'
```

**2) Écrire la leçon dans Mem0** :

```python
from mem0 import MemoryClient
client = MemoryClient()  # lit MEM0_API_KEY

res = client.add(
    messages=[{"role": "user", "content": LECON_TEXTE}],
    agent_id="hermes",
    metadata={"type": "lecon", "domaine": "marketing",
              "source": "<url youtube>", "date": "2026-06-13", "statut": "propose"},
)

# Après validation d'Allan :
client.update(memory_id=res["id"], metadata={..., "statut": "valide_allan"})
```

> ⚠️ **Jamais de données client / d'organisation Scribe** dans le free tier
> Gemini (Google peut s'en servir pour l'entraînement). Une vidéo YouTube
> publique = sans enjeu.

## Exemple rempli (sur la vidéo qui a lancé ce skill)

```python
client.add(
  messages=[{"role": "user", "content":
    "[LEÇON] Pour un agent, apprendre = écrire dans sa mémoire (Mem0), pas changer son modèle.\n"
    "- Leçon : un agent ne retient rien dans ses poids ; sa mémoire est un store externe (Mem0). "
    "Apprendre = y écrire une leçon ; progresser = la relire (dreaming).\n"
    "- Quand l'appliquer : dès qu'on demande de retenir / ne plus refaire, et à chaque démarrage de session.\n"
    "- Comment : mem0.add() la leçon taguée ; le dreaming la relit via mem0.search() ; si ce n'est pas écrit, ça n'existe pas.\n"
    "- Lien Scribe : méta — fondement du skill A: + renforce la règle d'or n°4."}],
  agent_id="hermes",
  metadata={"type": "lecon", "domaine": "claude-code",
            "source": "https://www.youtube.com/watch?v=k5NhsF7t68M",
            "date": "2026-06-13", "statut": "valide_allan"},
)
```

## Script complet — le skill `A:` branché sur Mem0 (étape 2)

> Consolidation des recettes ci-dessus en **un seul module** prêt à transmettre à
> Hermes. **Claude Code reste dans la boucle** : il *compose* les leçons (c'est le
> muscle qualité), le script ne fait que les **outils** (regarder / écrire /
> valider). Rien ne s'écrit dans Mem0 sans passer par Claude **et** la validation
> d'Allan (règle d'or n°4).

Le module complet et **exécutable** vit dans **[`apprendre.py`](./apprendre.py)** (racine du
repo) — `pip install mem0ai requests`. Il expose : `check_sender` · `watch_video` ·
`save_lesson` · `validate_lesson` · `dream`.

> **Source de vérité unique** : le code runnable est dans `apprendre.py`. On l'édite
> là — pas une copie collée ici — pour zéro risque de divergence.

**Orchestration (Claude Code dans la boucle)** — à la réception d'un `A: <url>` :

1. `check_sender(sender_id)` — sinon **escalade à Allan**.
2. `raw = watch_video(url)` — Gemini regarde (vidéo publique uniquement).
3. **Claude lit `raw`** et *compose* 1-3 leçons au gabarit `[LEÇON] …` — la qualité
   est ici, **pas** un copier-coller de Gemini.
4. Pour chaque leçon : `mid = save_lesson(...)` (statut `propose`).
5. Renvoyer la fiche à Allan sur Telegram : « Voici ce que j'ai retenu — je valide ? »
6. Sur « ok » : `validate_lesson(mid, …)`. Sur « corrige X » : ajuster, re-`save`.
7. Journaliser dans le Board (onglet Journal).

> **Test avant prod** : `save_lesson(..., domaine="test")` sur une vidéo bidon →
> vérifier l'entrée dans Mem0 → la supprimer (`mem0.delete`). **Jamais** de test
> sur des leçons réelles, jamais d'écriture Mem0 sans validation d'Allan.

## Boucle « dreaming » — relire les leçons validées (étape 3)

> « Dreaming » = l'agent **relit** ses leçons validées pour les **appliquer**.
> Pas de `cron`/`systemd` sur le VPS → c'est le **scheduler interne d'Hermes** (le
> job prospection de 9h) qui appelle `dream()` en début de run. **Lecture seule**
> (`mem0.search`) : aucune écriture, donc rien à valider — contrairement à
> `save_lesson`.

`dream()` (lecture seule) vit dans **[`apprendre.py`](./apprendre.py)**.
Signature : `dream(focus, domaines, par_domaine=3)` → renvoie un briefing texte des
leçons `valide_allan` des domaines visés.

**Branchement (scheduler interne d'Hermes, 9h)** :

```python
from apprendre import dream
# Au lancement de la prospection du matin :
brief = dream("acquisition clients site web", ["marketing", "ads", "saas"])
# → préfixer `brief` au contexte de la tâche : Hermes applique ce qu'il a appris,
#   au lieu de repartir de zéro chaque matin.
```

> Évolutions possibles (plus tard) : faire **décroître** les leçons jamais
> ressorties, ou **fusionner** les doublons. Pour l'instant on garde simple :
> relire les bonnes leçons au bon moment.

## Garde-fous (non négociables)

- **Validation humaine** avant qu'une leçon soit `valide_allan` (règle d'or n°4).
- **Jamais commiter un secret** (`.env*` gitignoré ; ne jamais afficher la valeur d'une clé).
- **Append, pas d'écrasement** : on ajoute des leçons, on ne réécrit pas l'historique.
- **Domaine = metadata**, jamais un dossier `appris/` (archi Mem0).
