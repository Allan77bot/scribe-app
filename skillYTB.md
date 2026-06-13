---
name: lire-videos-youtube
description: Use when Hermes (or any Claude Code agent) needs to read, summarize, analyze, or extract information from a YouTube video — transcript of what is said, or true visual understanding of what is shown (slides, screen demos, product walkthroughs). Triggers on "résume cette vidéo YouTube", "regarde cette vidéo", "transcript YouTube", "que dit/montre cette vidéo".
---

# Lire des vidéos YouTube avec Claude Code

> Source : recherche web vérifiée le 13/06/2026 (doc officielle Gemini API +
> repos GitHub réels). Prose FR, commandes/code EN (convention Scribe).

## La vérité de base

Claude Code **ne voit pas une vidéo nativement** — il n'a pas d'yeux sur
YouTube. Mais il a deux leviers, et c'est là qu'est le « jusqu'où » :

1. **Récupérer le transcript** (ce qui est *dit*) → texte, gratuit, robuste.
2. **Déléguer la vraie compréhension visuelle à Gemini** (ce qui est *montré*) →
   Gemini « regarde » l'image + écoute l'audio. C'est le niveau le plus haut.

Choisis selon ce dont tu as besoin : *ce qui est dit* ou *ce qui est montré*.

---

## Quick reference — quelle voie choisir

| Besoin | Voie | Coût | Voit l'image ? |
|---|---|---|---|
| Podcast, interview, cours parlé (le sens est dans la voix) | **A — yt-dlp transcript** | gratuit | ❌ texte seul |
| Tuto code, démo produit, slides, schémas (le sens est à l'écran) | **B — Gemini URL** | gratuit en preview | ✅ audio + image |
| Vidéo **privée / non listée** | B mais via **File API** (download d'abord) | gratuit/payant | ✅ |
| On veut que ce soit « outillé » comme un MCP | **C — yt-dlp-mcp** | gratuit | ❌ texte seul |

Règle simple : **« ce qui est dit » → Voie A. « ce qui est montré » → Voie B.**

### Statut officiel (important si on veut rester clean)

- **Voie B — Gemini API = 100 % officiel** (produit Google, en preview). La voie
  propre, à **privilégier par défaut**.
- **Voie A — yt-dlp = open-source standard mais PAS une API officielle** YouTube
  (c'est un scraper → zone grise vs CGU YouTube). OK usage perso/R&D, à utiliser
  en **dépannage** quand on a juste besoin du texte parlé et pas de clé Gemini.
- Note : il n'existe **aucune API officielle YouTube** pour le transcript d'une
  vidéo qu'on ne possède pas — d'où l'usage de yt-dlp ou Gemini.

---

## Voie A — Transcript via `yt-dlp` (le défaut)

Un seul binaire, **aucune clé API**. Récupère les sous-titres (manuels OU
auto-générés) et les convertit en texte.

```bash
# Installer (une fois)
pip install -U yt-dlp        # ou: brew install yt-dlp / apt install yt-dlp

# Récupérer les sous-titres en texte (fr puis en en repli), sans télécharger la vidéo
yt-dlp --write-auto-subs --write-subs --sub-langs "fr,en" \
       --skip-download --convert-subs srt \
       -o "%(title)s.%(ext)s" "https://www.youtube.com/watch?v=VIDEO_ID"
```

Tu obtiens un `.srt` / `.vtt`. Pour le donner propre au modèle, retire les
timestamps et numéros de ligne (regex `^\d+$` + lignes `-->`), ou lis-le tel
quel — Claude gère très bien le `.srt` brut.

**Limites :** texte seulement. Aucune slide, aucun geste, aucune démo écran.
Le transcript auto se trompe sur les noms propres et le jargon technique.

---

## Voie B — Compréhension multimodale réelle via Gemini API (le « jusqu'où »)

On **passe l'URL YouTube directement à Gemini**. Il reçoit le flux audio+vidéo
brut : il comprend ce qui est montré à l'écran, pas seulement ce qui est dit.
C'est ce qui permet « décris ce que fait la personne à 02:15 » ou « lis le code
affiché sur la slide ».

Prérequis : une `GEMINI_API_KEY` (Google AI Studio, gratuit pour démarrer).

Exemple Node (le projet Scribe est en Node — SDK `@google/genai`) :

```js
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({}); // lit GEMINI_API_KEY depuis l'env

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash", // vérifier le dernier modèle Flash dispo
  contents: [
    { fileData: { fileUri: "https://www.youtube.com/watch?v=VIDEO_ID" } },
    { text: "Résume cette vidéo en 3 phrases, puis liste ce qui est montré à l'écran." },
  ],
});
console.log(response.text);
```

Équivalent cURL (utile en headless sur le VPS) :

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" -H 'Content-Type: application/json' -X POST \
  -d '{"contents":[{"parts":[
        {"text":"Résume et décris ce qui est montré à l écran."},
        {"file_data":{"file_uri":"https://www.youtube.com/watch?v=VIDEO_ID"}}
      ]}]}'
```

**Cibler un moment précis** — demander avec un timestamp `MM:SS` :
> « Que montrent les exemples à 00:05 et à 02:10 ? »

**Limites officielles (à connaître) :**
- **Vidéos publiques uniquement** (ni privées ni non listées) par URL directe.
- Free tier : **max 8 h de vidéo YouTube / jour**. Payant : pas de limite de durée.
- Gemini 2.5+ : jusqu'à **10 vidéos par requête**.
- Preview = **gratuit aujourd'hui**, mais prix/limites « susceptibles de changer ».
- Vidéo > 10 min ou requêtes répétées sur la même vidéo → utiliser le
  **context caching** (traite la vidéo une fois, réutilise les tokens) pour le coût/latence.

**💰 Coût & confidentialité (À LIRE) :**
- **Gratuit aujourd'hui** : clé API gratuite sur Google AI Studio (sans carte),
  et l'URL YouTube est gratuite en preview (≤ 8 h/jour). Pour de la veille sur
  des **vidéos publiques**, c'est gratuit et suffisant.
- **⚠️ Données NON privées en free tier** : Google se réserve le droit
  d'utiliser tes entrées/sorties pour entraîner ses modèles. C'est sans enjeu
  pour une vidéo YouTube **publique** (déjà publique), mais **JAMAIS de données
  client / d'organisation Scribe dans le free tier Gemini** — ça violerait les
  règles d'or (isolation par org, données UE). Données sensibles = tier payant
  (privé, non utilisé pour l'entraînement) ou on ne passe pas par Gemini.
- **Preview = peut changer** : prix et limites « susceptibles de changer » (dixit
  la doc officielle). Gratuit *maintenant* n'est pas une garantie.

**Vidéo privée / non listée :** l'URL directe ne marche pas. Il faut la
télécharger (`yt-dlp`) puis l'envoyer via la **File API** de Gemini (2 GB en
gratuit). C'est la seule façon de « regarder » une vidéo non publique.

---

## Voie C — MCP `yt-dlp` (optionnel)

Si tu veux que la récupération de transcript soit un outil natif de l'agent
plutôt qu'une commande shell : **`kevinwatt/yt-dlp-mcp`** (serveur MCP qui
expose download vidéo, métadonnées, transcripts). Pratique si Hermes manipule
beaucoup de vidéos. Sinon, la Voie A en shell suffit.

---

## Pièges & honnêteté

- **Transcript ≠ compréhension.** Une démo de code sans narration ne donnera
  presque rien en Voie A. Passe en Voie B.
- **Rate-limit / age-gate yt-dlp :** ajouter `--cookies-from-browser chrome`
  (ou un fichier cookies) si YouTube bloque. Ne jamais commiter de cookies.
- **Coût Gemini :** gratuit en preview mais surveille le quota 8 h/jour et
  bascule sur context caching pour les vidéos longues.
- **Le modèle peut halluciner** sur les détails visuels fins (texte minuscule à
  l'écran) — vérifie ce qui est critique.

## Lien avec Scribe (ne pas confondre les périmètres)

Ces voies servent la **veille / R&D** de Hermes (digérer une conf, un tuto).
Elles **ne remplacent pas** le pipeline produit Scribe : la transcription des
notes vocales reste sur **OpenAI mini** (déjà tranché, cf. stack IA hybride).
Ne pas câbler Gemini-vidéo dans le produit sans validation — c'est un outil de
travail pour l'agent, pas une brique du pipeline.
