---
name: kit-transmission-hermes
description: Use when deploying Hermes' new capabilities to the VPS — runbook to verify the API keys, test the Mem0 write safely, load the soul manifesto, transmit the skills to Hermes via Telegram, and wire the dreaming loop. À suivre UNE fois, sur le VPS, par Allan.
---

# Kit de transmission — Hermes (étape 4)

> Mise en prod des étapes 1-3 (manifeste « soul » + skill `A:` + dreaming).
> **Tout se fait sur le VPS, par Allan.** Claude a écrit le code ; ici on le
> branche pour de vrai. Prose FR, commandes EN. Ordre à respecter.

> ⚠️ **Signatures Mem0** : elles peuvent varier selon la version de `mem0ai`.
> Si une commande casse, c'est le 1er endroit à checker — et c'est exactement
> pourquoi l'étape 3 teste d'abord sur `domaine="test"` avant tout usage réel.

---

## 0. Pré-requis

- Être sur le VPS, dans l'environnement d'Hermes : `cd /home/hermes/.hermes/home/`.
- Vidéos **publiques** uniquement, **jamais** de données client dans Gemini free tier.

## 1. Vérifier les 2 clés (sans jamais les afficher)

```bash
# Affiche "présent" si la variable existe, rien sinon — la valeur reste secrète.
echo "GEMINI_API_KEY: ${GEMINI_API_KEY:+présent}"
echo "MEM0_API_KEY:   ${MEM0_API_KEY:+présent}"
```

Si l'une manque → la renseigner dans l'environnement d'Hermes (jamais en clair
dans un fichier commité, jamais l'écho de la valeur).

## 2. Installer les dépendances

```bash
python3 -m pip install --upgrade mem0ai requests
```

## 3. Test d'écriture Mem0 — la PREUVE que ça marche (safe : `domaine="test"` + delete)

> Écrit une leçon bidon, la relit, puis la supprime. Aucune trace réelle.

```python
# test_mem0.py
from mem0 import MemoryClient
m = MemoryClient()                       # lit MEM0_API_KEY

res = m.add(messages=[{"role": "user", "content": "[TEST] ping dreaming, à supprimer"}],
            agent_id="hermes",
            metadata={"type": "lecon", "domaine": "test", "statut": "propose"})
mid = res["id"] if isinstance(res, dict) else res[0]["id"]
print("écrit :", mid)

print("relu  :", m.search("ping dreaming", agent_id="hermes",
                          filters={"metadata": {"domaine": "test"}}))

m.delete(memory_id=mid)                  # nettoyage
print("supprimé OK")
```

```bash
python3 test_mem0.py && rm test_mem0.py
```

Si les 3 lignes s'affichent → **`save_lesson` / `dream` / la suppression marchent.**

## 4. Charger le manifeste « soul » en mémoire système (une fois)

> `infer=False` = stockage **verbatim** (sinon Mem0 risque de résumer le texte).
> Vérifier que ce paramètre existe dans ta version de `mem0ai` ; sinon, retirer.

```python
# load_manifeste.py — à lancer depuis le dossier qui contient le .md
from mem0 import MemoryClient
m = MemoryClient()
texte = open("manifeste-soul-hermes.md", encoding="utf-8").read()
m.add(messages=[{"role": "system", "content": texte}],
      agent_id="hermes",
      metadata={"type": "system", "doc": "manifeste-soul",
                "version": "2026-06-13", "statut": "valide_allan"},
      infer=False)
print("manifeste chargé en mémoire système")
```

## 5. Transmettre les skills à Hermes (Telegram)

**Message à envoyer à Hermes** (copier-coller) :

```
🧭 Hermes — mise à jour de tes capacités (validée Allan, 2026-06-13)

1) MANIFESTE « SOUL » = ton cap. Tu es le centre opérationnel d'Atelier Klar
   (co-gérant), jamais le perso d'Allan. 3 piliers de l'année :
   (1) acquisition clients sites web, (2) livrer les produits récurrents
   (apps MRR + sites web), (3) faire monter Allan en compétence.
   → chargé dans ta mémoire système (manifeste-soul-hermes.md).

2) SKILL "A:" — quand Allan SEUL (1374851322) t'envoie "A: <lien YouTube>",
   tu apprends de la vidéo : Gemini regarde → Claude compose 1-3 leçons →
   tu les écris dans Mem0 (statut "propose") → tu renvoies à Allan pour
   validation. Détail : skillapprentissage.md.

3) SKILL VIDÉO — tu peux lire une vidéo YouTube publique via Gemini.
   Détail : skillYTB.md.

PERMISSION : code lourd / skill A: = Allan seul. Alphim·Shane (7533858975)
= crons / RDV / veille ; si tâche lourde → escalader à Allan avant d'agir.
```

> Option « mémoire durable » : tu peux aussi pousser les 2 skills dans Mem0
> (`type:"skill"`, `infer=False`) pour qu'Hermes les retrouve seul, comme le
> manifeste à l'étape 4.

## 6. Brancher la boucle « dreaming » sur le scheduler 9h

Dans le job de prospection de 9h d'Hermes (scheduler interne — pas de cron
système), au tout début du run :

```python
from apprendre import dream                # le module runnable du repo (apprendre.py)
brief = dream("acquisition clients site web", ["marketing", "ads", "saas"])
# → préfixer `brief` au contexte de la tâche de prospection.
```

## 7. Garde-fous (rappel)

- **Jamais** d'écriture Mem0 réelle sans validation d'Allan (règle d'or n°4).
- **Jamais** afficher / commiter une clé (`.env*` gitignoré).
- **Jamais** de données client / hors UE dans Gemini free tier.
- Hermes opère **uniquement** sur Atelier Klar — jamais le perso d'Allan.
