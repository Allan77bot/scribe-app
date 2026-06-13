---
name: piloter-notebooklm
description: Use when Hermes (or any Claude Code agent) needs to connect to, drive, or automate NotebookLM — create notebooks, add sources, generate audio/video overviews, query notebooks programmatically. Triggers on "plug NotebookLM", "API NotebookLM", "automatiser NotebookLM", "génère un audio overview", "pilote mon NotebookLM".
---

# Piloter NotebookLM avec Claude Code

> Source : recherche web vérifiée le 13/06/2026 (doc Google Cloud officielle +
> repos GitHub réels). Prose FR, commandes/code EN (convention Scribe).

## La vérité courte (lis ça en premier)

- **API officielle NotebookLM = Enterprise UNIQUEMENT** (Google Cloud, édition
  NotebookLM Enterprise, rôles IAM). **Ta version Pro grand public n'y a PAS
  accès.** L'API consommateur est promise par Google depuis 2024… toujours pas
  livrée en juin 2026.
- **MAIS** un outil communautaire, **`notebooklm-mcp-cli`**, expose un **serveur
  MCP** qui pilote **TON compte NotebookLM** (Pro inclus) via tes cookies de
  navigateur. Hermes (Claude Code) peut s'y brancher en **une commande**. C'est
  **non officiel** — à tes risques, usage perso/expérimental.

Donc : *officiellement*, non, Hermes ne se branche pas sur ton NotebookLM Pro.
*En pratique*, oui, via le MCP communautaire ci-dessous — en assumant le risque.

---

## Quick reference — quelle option

| Ton besoin | Option | Officiel ? | Pour toi (Pro, solo) |
|---|---|---|---|
| Hermes pilote TON NotebookLM Pro existant | **1 — notebooklm-mcp-cli** | ❌ non officiel | ✅ ça marche aujourd'hui |
| Solution supportée/conforme, tu passes Enterprise | **2 — API Enterprise** | ✅ | ⚠️ cher/surdimensionné solo |
| Juste des « audio overviews » auto, sans NotebookLM | **3 — AutoContent API** | ✅ (tiers) | ✅ si le besoin = podcasts auto |

---

## Option 1 — `notebooklm-mcp-cli` (la voie qui marche pour toi)

Repo : **`github.com/jacob-bd/notebooklm-mcp-cli`** — actif (v0.7.x, juin 2026,
~4.9k ⭐, licence MIT). Fournit une CLI `nlm` **et** un serveur MCP
`notebooklm-mcp`. Il se connecte à NotebookLM via **tes cookies** : il agit
comme toi, donc tout ce que ton compte **Pro** peut faire, l'outil le peut.

```bash
# 1. Installer (Python — uv recommandé)
uv tool install notebooklm-mcp-cli        # ou: pipx install notebooklm-mcp-cli

# 2. S'authentifier avec TON compte (ouvre un navigateur, récupère les cookies)
nlm login

# 3. Brancher Claude Code dessus en une commande
nlm setup add claude-code                 # (aussi: gemini, cursor, github-copilot, cline…)

# 4. Vérifier que tout est sain
nlm doctor
```

Une fois branché, Hermes pilote NotebookLM **en langage naturel** :
> « Crée un notebook sur la coordination d'équipe, ajoute ces 5 URLs comme
> sources, puis génère un audio overview. »

**Ce que l'outil sait faire** (35 outils MCP, échantillon) :

| Action | CLI | Outil MCP |
|---|---|---|
| Lister / créer un notebook | `nlm notebook list` / `create` | `notebook_list` / `notebook_create` |
| Ajouter des sources (URL, texte, Drive, fichier) | `nlm source add` | `source_add` |
| Interroger un notebook | `nlm notebook query` | `notebook_query` |
| Générer du Studio (Audio, Vidéo…) | `nlm studio create` | `studio_create` |
| Télécharger les artefacts produits | `nlm download <type>` | `download_artifact` |
| Recherche web/Drive → sources | `nlm research start` | `research_start` |
| Lots / pipelines multi-étapes | `nlm batch` / `nlm pipeline run` | `batch` / `pipeline` |

**⚠️ Disclaimer officiel du repo (mot pour mot) :** l'outil utilise des **APIs
internes** qui *« sont non documentées et peuvent changer sans préavis »* et
*« nécessitent l'extraction des cookies de ton navigateur »*. *« À utiliser à
tes propres risques, pour un usage personnel/expérimental. »*

**⚠️ Spécial VPS headless (le cas de Hermes) :** `nlm login` veut un navigateur
pour capter les cookies. Sur un VPS sans écran, deux options :
1. Faire `nlm login` **sur ta machine locale**, puis transférer le fichier de
   session/cookies vers le VPS (chemin indiqué par `nlm doctor`).
2. Garder le pilotage NotebookLM **en local** et ne déléguer au VPS que ce qui
   n'a pas besoin du login.
Les cookies sont **sensibles** : jamais dans Git, jamais dans le repo Scribe.

---

## Option 2 — API officielle NotebookLM Enterprise

Si un jour tu passes en **NotebookLM Enterprise** (Google Cloud) : il existe une
**vraie API documentée** (`docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise`)
pour créer/gérer notebooks, sources et audio overviews. Prérequis : projet
Google Cloud + rôle IAM **Cloud NotebookLM User**. C'est **officiel, supporté,
conforme** — mais c'est une offre **organisation**, surdimensionnée et coûteuse
pour un solo. À garder en tête si Scribe grossit. (Note : l'ancienne *Podcast
API* autonome est marquée **dépréciée**, nouveaux clients non admis.)

---

## Option 3 — Reproduire la VALEUR sans NotebookLM : AutoContent API

Si ton vrai besoin n'est pas « NotebookLM » mais « un **audio overview à 2 voix**
généré automatiquement », il existe une **API REST publique tierce**,
**AutoContent API** (`autocontentapi.com`), qui produit des podcasts style
NotebookLM + résumés/guides/timelines à partir d'**URL, PDF, YouTube ou texte**.
Clés API, webhooks, serveur MCP, prix à la requête. **Ce n'est pas NotebookLM**,
mais c'est **officiel et automatisable proprement** — souvent le meilleur choix
si l'objectif est la production de contenu, pas la gestion de notebooks.

---

## Pièges & honnêteté (à lire avant de câbler quoi que ce soit)

- **Option 1 = non officiel.** Peut **casser à toute mise à jour** de
  NotebookLM. C'est OK pour la R&D perso de Hermes ; ce **n'est pas** une base
  fiable pour un produit.
- **Conformité / périmètre Scribe.** Pousser des **données client** dans
  NotebookLM = sortie hors du périmètre **Supabase UE** de Scribe. Ça touche
  directement les règles d'or (isolation par org, storage UE). **Ne pas** faire
  transiter de données d'organisation par NotebookLM sans validation explicite
  d'Allan.
- **Ne bâtis pas le produit Scribe sur une API interne non officielle.** Pour le
  produit : briques **officielles** uniquement. Le MCP NotebookLM = outil
  personnel de l'agent, pas une dépendance produit.

## Décision en une ligne

- Tu veux que **Hermes pilote ton NotebookLM Pro maintenant** → **Option 1**
  (assume le « non officiel », garde les cookies hors Git).
- Tu veux **officiel/supporté** → **Option 2** (Enterprise) ou **Option 3**
  (AutoContent) selon que tu as besoin de *notebooks* ou de *contenu auto*.
