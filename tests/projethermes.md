# Atelier Klar — Contexte pour Claude Code (à copier dans tout nouveau projet)

> Briefing portable, rédigé le 2026-06-12. But : permettre à une instance Claude Code travaillant
> sur une **nouvelle app** de s'intégrer proprement à l'écosystème Atelier Klar existant.
> Source de vérité complète : dossier `AtelierKlar/Structuration/` (lire `SNAPSHOT.md` puis `CLAUDE.md`).

## 1. Qui on est

- **Atelier Klar** = studio web pour commerces de caractère. Marque commerciale **sans SIREN** :
  l'émetteur légal d'un devis/facture est toujours **Allan** (commercial, encaisse le solde 50 %)
  ou **Alphim** (dev/design, encaisse l'acompte 50 %). Co-traitance 50/50, bascule SAS fin 2026.
- Équipe = 4 : ♦ Allan · ♠ Alphim · ♥ Claude (Claude Code, poste d'Allan) · ♣ Hermes (agent autonome).
- Principe directeur : **vendre d'abord, automatiser au volume.** Ne pas sur-ingénierer.

## 2. Hermes — ce qu'il fait actuellement

**Hermes Agent** (produit open-source NousResearch, MIT) auto-hébergé en Docker sur le **VPS Hostinger** d'Allan.
Ne pas confondre avec les modèles LLM « Hermes » — ici c'est l'orchestrateur. Il est model-agnostique,
branché sur **DeepSeek** (cible : `deepseek-v4-flash`, les anciens IDs sont dépréciés au 2026-07-24).

| Capacité | Détail |
|---|---|
| **Canal** | Telegram (bot privé d'Allan) |
| **Google** | lit/écrit Drive + Sheets + Gmail via la CLI `gws`, compte `contact@atelierklar.fr` |
| **Scraping** | web scraper (OSM/Overpass, annuaires) |
| **Cron** | tâches planifiées — aujourd'hui : **prospection quotidienne à 9h** |

**Ses missions en place :**
1. **Prospection** : scrape des commerces de Meaux (77), qualifie les signaux (pas de site, site obsolète…),
   rédige un brouillon d'approche, et alimente le Sheet **« Prospection Atelier Klar »** onglet `Leads`
   (ID `1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o`). Statuts : Nouveau / À valider / Validé / Contacté / Relancé / In / Out. Colonne K = Téléphone.
2. **Exécution de tâches** : lit le **Board interne** (cf. §3), prend les lignes `Responsable = Hermes`,
   exécute, met à jour le `Statut` et **journalise chaque action** dans l'onglet `Journal`.
3. **Intégration au cockpit** (en cours) : clone le repo GitHub du dashboard pour proposer des évolutions —
   **uniquement par branche + PR**, jamais de push direct sur `main`.

**Ce que Hermes ne fait JAMAIS (mur déterministe)** : émettre devis/factures, toucher aux numéros,
montants ou mentions légales. Ce circuit reste mécanique (HTML→PDF aujourd'hui, n8n+PDFMonkey au volume).
Un agent déclenche ou rédige des brouillons — il n'émet rien.

## 3. L'écosystème data (tout vit sur `contact@atelierklar.fr`)

| Brique | Où | Rôle |
|---|---|---|
| **Drive** | racine `ATELIER KLAR` (`1Yr_2HfHeILgpBESpkZpHIs0mmdpjREsl`) | arborescence `00-Pilotage` → `06-Partenaires`, 1 dossier/client (`1-Devis & Contrat`, `2-Contenus`, `3-Production`, `4-Factures`) |
| **Board interne** | Sheet `1vNpZG4gtbxu2YeINNKl9E7MikJEKiY0nSEp4rvDRj60` | **source unique des tâches** — onglets `Taches` / `Projets` / `Journal` / `Stats`. Toute MAJ = ligne Journal |
| **CRM** | Sheet `1_ggSDvYDJZgDMQUh0opePXItm9WwaC049zMAuHKHfVE` | onglet `Pipeline` (26 col. A→Z : identité légale client, pack, n° devis/factures, statuts colorés) + `Paramètres` (listes + compteurs AK-DEV/AK-PH/AK-AL) |
| **Prospection** | Sheet `1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o` | leads scrapés par Hermes ; un lead « In » bascule à la main dans le Pipeline CRM |
| **Cockpit** | repo privé `github.com/Allan77bot/atelierklar-board` → Netlify | dashboard statique (zéro build) sur le Board : kanban drag & drop, login Allan/Alphim, écriture via **Apps Script** (`apps-script/Code.gs`), journal signé |

⚠️ Le Board et la Prospection sont des Sheets **lisibles par lien** (le dashboard lit le CSV public) →
**aucune donnée sensible dedans** (pas d'IBAN, pas de montants nominatifs clients, pas de secrets).

## 4. Conventions & invariants (à respecter dans toute nouvelle app)

1. **Validation explicite d'Allan** avant tout push GitHub, déploiement ou suppression de fichier.
2. **n8n** : ne jamais modifier un workflow existant (clients SynkroniseIA) — créer des workflows préfixés `AK_`.
3. **Fiscal** : franchise de TVA → mention « TVA non applicable, art. 293 B du CGI », prix nets, jamais de montant de TVA.
4. **Charte** : « Vacheron stratifiée » — obsidienne `#0A0708`, ivoire `#F0E8D6`, bordeaux `#6E1F2C`,
   or-terre `#A8804D`, patine `#8A7A65` + typo **IBM Plex** (Sans/Serif/Mono). Tokens prêts :
   `Structuration/marque/design-tokens.json` + `tokens.css`. Enseignes d'équipe : ♦ Allan (rouge), ♠ Alphim (noir), ♥ Claude, ♣ Hermes (vert).
5. **Toute tâche significative** = une carte dans le Board (responsable + statut) ; toute action d'agent = ligne `Journal`.
6. Agents sur les repos : **branche + PR**, jamais de push direct `main` (un push `main` = déploiement Netlify).

## 5. Intégrer une nouvelle app à cet écosystème

- **Repo** : créer un repo GitHub **privé** dédié sous le compte `Allan77bot` (modèle : `atelierklar-board`).
  Ne JAMAIS commiter de `client_secret*.json`, tokens, ou données clients (voir le `.gitignore` du cockpit).
- **Données** : privilégier les Sheets existants comme backend léger (lecture CSV gviz si public,
  écriture via Apps Script ou `gws`). Ne pas créer de nouvelle base sans raison.
- **Accès Google** : passer par `gws` (déjà authentifié `contact@`) — reconnexion :
  `node Structuration/_setup/gws-oauth.mjs`. Pas de connecteur sur le compte perso.
- **Brancher Hermes** : lui assigner des tâches via le Board (`Responsable = Hermes`) ; s'il doit
  toucher au code de l'app, lui donner un fine-grained PAT limité au repo, et exiger des PR.
- **UI** : repartir des tokens de charte + IBM Plex ; s'inspirer du cockpit (`site/assets/styles.css`,
  design system shadcn-like déjà calibré pour les 2 thèmes jour/nuit).
- **Documenter pour les agents** : un `README.md` qui dit le rôle, le flux de données, et les limites
  (modèle : README du cockpit), + une ligne dans `Structuration/SNAPSHOT.md` §6.

## 6. Pointeurs

- Local : `C:\Users\allan\OneDrive\Desktop\AtelierKlar\Structuration\` (briefs détaillés dans `brief/00…08`)
- Cockpit : `C:\Users\allan\OneDrive\Desktop\AtelierKlar\atelierklar-board\` · https://github.com/Allan77bot/atelierklar-board
- Hermes (réalité vérifiée + runbook) : `Structuration/docs/superpowers/plans/2026-06-10-hermes-RAPPORT-REALITE.md`
- Organisation Allan×Alphim (routage, communication) : `Structuration/brief/08-organisation-allan-alphim.md`
