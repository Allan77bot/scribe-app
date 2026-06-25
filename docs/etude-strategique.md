# Étude stratégique Scribe IA — ICP, marché, fonctionnalités, audit stack

> **Date : 2026-06-19.** Document de projection produit/marché. Produit par 5 agents
> (marketing · UX/UI · sécurité · psychologie/rétention · vérification adversariale),
> recherche web firecrawl, marché **francophone (FR/BE/CH/QC)**.
> À lire avec `brief-produit.md` (spec canonique). Ici = la **direction**, pas la spec.

---

## 0. Décision tranchée : Route B (validée par Allan, 2026-06-19)

> **ICP = équipes en relais (3×8). Tête de pont : industrie / logistique /
> agro-alimentaire / santé, PME 20–150 salariés en 2-3 équipes, France d'abord.**
>
> **Statut : VALIDÉ par Allan le 2026-06-19 — « on go Route B ».** La Route A devient
> le cas « organisation à 1 shift », secondaire.

Les 4 angles d'étude ont conclu **indépendamment** à Route B. La Route A
(dirigeants/PME) devient le cas « organisation à 1 shift » — secondaire, pas la cible.

| Critère | Route A (PME/dirigeants) | **Route B (relais 3×8)** |
|---|---|---|
| Concurrence directe | Forte (Notion, Asana, Monday, ClickUp) | **Quasi nulle** |
| Urgence du problème | Faible (« on gère sur WhatsApp ») | **Élevée** (erreur de passation = incident) |
| Volonté de payer | Moyenne (comparent au gratuit) | **Élevée** (coût d'une mauvaise passation > 99 €/mois) |
| Accès pour un solo founder | Difficile (marché générique) | **Plus facile** (douleur précise, décideur opérationnel) |
| Ancrage d'habitude | Faible (usage irrégulier) | **Fort** (le changement de shift EST le déclencheur) |
| Churn mensuel attendu | 3–4 % | **1,5–2 %** |

---

## 1. L'enjeu réel : une infrastructure de passation, pas un outil de transcription

- Un outil de transcription est **optionnel** → on l'abandonne. Une **infrastructure
  de passation** s'insère dans un rituel métier obligatoire (la relève d'équipe) →
  on ne peut plus s'en passer. C'est ce qui crée la rétention.
- **Le créneau est réellement vide.** Personne ne combine : capture vocale push-to-talk
  + extraction IA structurée + anti-collision temps réel + validation humaine +
  rapport de passation auto + accusés de lecture + RGPD/UE. Otter/Fireflies = réunion.
  Notion/Asana = tâche. Eviview = passation mais **sans IA vocale**.

---

## 2. ICP — personas à viser

**Primaire — « Le responsable d'équipe opérationnelle en relais ».**
Chef de production / coordinateur logistique / infirmier coordinateur / responsable
de quart. Équipe 5–25 personnes, 2-3 shifts. Organisé dans son métier mais débordé
administrativement, allergique aux logiciels complexes, valorise la fiabilité sur
l'innovation. **Déclencheur d'achat :** un incident récent de passation (client perdu,
tâche refaite, presque-accident). Le geste vocal lui est naturel — il briefait déjà
ses équipes à l'oral.

**Secondaire — « Le dirigeant de PME multi-chantiers »** (BTP, plomberie, services à
domicile, 5–15 salariés). Pivot d'info ; quand il n'est pas joignable, ça bloque.
Rétention plus fragile (pas de rituel fixe).

---

## 3. Marché — chiffres VÉRIFIÉS uniquement

> Chaque chiffre est passé par un agent de vérification adversariale. On ne garde
> que le solide.

**Solide (sources primaires) :**
- Marché mondial « collaboration d'équipe » : **40,2 Md$ (2025) → 85,2 Md$ (2033),
  CAGR 9,7 %** — Grand View Research.
- SAM Route B francophone : **~45 000–60 000 entreprises** avec équipes en relais →
  ordre de grandeur **~50 M€/an** à 99 €/mois (estimation, confiance moyenne).
- France : ~159 000 PME (10-250 sal., BPI France 2024).
- **35 % des réunions sont improductives** (LSE/Protiviti, oct. 2024).
- **Plus de la moitié des réunions sont non planifiées / ad hoc** (Microsoft Work
  Trend Index 2025).
- NRR médian SaaS privé ~**101 %** en 2024 ; churn mensuel SMB sain **3–5 %**.

**À NE PAS utiliser (descendus par la vérification) :**
- ❌ « 50 Md$ de pertes dues aux passations de shift » → FAUX. Le vrai chiffre Deloitte
  = **downtime machine non planifié**, pas les passations. Reformuler : *« le downtime
  non planifié coûte 50 Md$/an, dont la passation est un facteur. »*
- ❌ « 70 % des décisions oubliées en 24h » → chaîne de sourcing cassée (introuvable
  dans la source citée).
- ❌ « 37,5 % d'activation / 98 % de churn en 2 sem. » → blog sans méthodologie.

**Honnêteté de fond :** le marché de la niche exacte (voix → passation) n'a pas de
taille publiée. Risque (à éduquer) **et** chance (pas de leader installé).

---

## 4. Fonctionnalités — garder / ajouter / supprimer

**✅ GARDER (cœur, ne pas toucher) :** capture vocale, extraction IA, anti-collision*,
validation humaine, rapport de passation, accusés de lecture. *(\*anti-collision =
listé cœur mais PAS ENCORE construit — voir §7.)*

**➕ AJOUTER (par priorité de rétention/vente) :**
1. **Invitation obligatoire d'un collègue à l'onboarding.** Le plus critique. Le
   « moment aha » n'existe que quand un collègue reçoit/lit/valide une passation.
   À provoquer en < 48h.
2. **Templates de passation par secteur** (industrie / santé / logistique) pré-remplis
   avec les tâches ouvertes — geste quotidien < 60 s.
3. **Notifications push** : déclencheur fin de shift + validation en attente. Une seule
   par cycle, jamais de spam.
4. **Accusé de lecture actionnable** (valider/réassigner depuis la notif).
5. **Rapport hebdo auto au manager** (« 47 tâches coordonnées, 0 doublon ») → ROI visible.
6. **Historique de passation cherchable** → mémoire d'équipe = coût de sortie max.
7. **Conformité (bloquants avant 1ʳᵉ vente)** : DPA signable, page `/conformité`, CGU
   mentionnant l'IA, fonction « supprimer mon organisation ».
8. **Dark mode** (équipes de nuit) — pas P1, via `prefers-color-scheme`.

**➖ SUPPRIMER / NE PAS PRIORISER :**
- Rapport e-mail quotidien pour le terrain (ils n'ouvrent pas leurs mails) → push/in-app.
- Intégrations CRM/Slack/Notion maintenant → distraction.
- Tags sur notes (si recherche full-text OK).
- Messagerie libre → deviendrait un mauvais Slack. **La contrainte du format passation
  EST la valeur.**
- Gamification individuelle / badges → infantilisant pour le terrain. (Un *streak
  d'équipe* collectif est OK.)
- Vocabulaire « sanction » / « surveillance » → danger juridique + tue l'adoption.
  Reformuler en « coordination / passation / continuité ».

⚖️ **Décision à trancher (pas dans l'urgence) — pricing :** le marketing recommande le
**prix par siège** (abandon du quota minutes, jugé anxiogène). MAIS le brief §7 fait du
quota minutes une règle de contrôle des coûts IA (prix ≥ 3× coût IA). Arbitrage :
*par-siège = vente plus simple mais expose la marge si un client transcrit énormément.*

---

## 5. Angles marketing (nettoyés)

Le meilleur angle n'est pas une stat-choc (fragiles), c'est **le récit + la
différenciation RGPD** :
- **« L'équipe de nuit a décidé. À 6h, l'équipe de jour ne le sait pas. »** — la douleur racontée.
- **« L'IA propose, l'humain confirme. »** — désamorce la peur de la surveillance, et c'est vrai.
- **« Conçu pour le droit français, hébergé en UE »** — face à Otter/Fireflies/Notion
  (tous US). Fossé défendable.
- Stats utilisables : 35 % de réunions improductives (LSE), > 50 % ad hoc (Microsoft).

---

## 6. Design, sécurité, rétention (synthèse)

**Design — 3 écrans à rendre irréprochables :** (1) capture vocale (< 1 s, états clairs,
haptique) ; (2) passation lisible en 30 s (3 zones colorées + accusé sticky) ; (3) hub
= page d'action, pas de stats.

**Sécurité = argument de vente :** « kit de déploiement légal » fourni au client (notice
salariés + clause règlement intérieur + checklist consultation CSE) — aucun concurrent
US ne le fait. Cadrage juridique non négociable : information préalable des salariés
(Art. L.1222-4), **consultation CSE obligatoire dès 50 salariés** (Art. L.2312-38).
Repère : CNIL a sanctionné 40 000 € en déc. 2024 pour surveillance disproportionnée
(SAN-2024-021). Sous-traitance IA : OpenAI (entité **Irlande** UE, rétention 30 j, pas
d'entraînement API) et **Anthropic Ireland Ltd** (UE, via SCCs). Option « tout-UE »
(Azure OpenAI EU) = plan premium grands comptes/santé.

**Rétention — le vrai risque produit :** activation **multi-utilisateur en 24-48h = ça
passe ou ça casse**. Cible : « ≥ 2 users du même compte ont échangé une passation +
accusé de lecture en 48h ». Churn cible Route B : 1,5–2 %/mois. Mécaniques OK : streak
d'**équipe**, accusé de lecture comme pression sociale douce, rapport hebdo. À éviter :
notification fatigue (1/cycle max), gamification individuelle, surveillance perçue.

---

## 7. Audit stack actuelle ↔ recos UX/UI (2026-06-19)

État **réel du code** confronté aux recommandations. Preuves `fichier:ligne`.

**Déjà fait, et bien fait :**
- ✅ Waveform **Web Audio réelle** (`AudioRecorder.tsx:43-87`, AnalyserNode + RAF).
- ✅ 5 états de capture (`AudioRecorder.tsx:195-245`) + gestion erreur micro (`:109-144`).
- ✅ Accusés de lecture « qui a lu / quand » (`ReadReceiptList.tsx:30-98`).
- ✅ Billing **hors du hub** (déjà conforme), empty states travaillés (tasks/handover/report),
  Manrope + tokens clairs (`globals.css`, primaire `#0059bb`, navy `#002b5b`).

**Écarts pour Route B (par priorité) :**

| # | Reco étude | État réel (preuve) | Verdict |
|---|---|---|---|
| 1 | **Anti-collision** (pilier) | ❌ ABSENT — pas de `task_claims`/`claimed_by` ni UI « X est dessus » | 🔴 Critique — listé « cœur » au brief, **jamais construit** |
| 2 | Invitation collègue **obligatoire** onboarding | ⚠️ OPTIONNELLE (`OnboardingWizard.tsx:95`) | 🔴 Critique — levier de rétention n°1 |
| 3 | **Notifications push** | ❌ ABSENT — pas de SW ni Notification API | 🔴 Critique — boucle d'habitude + accusé actionnable |
| 4 | Passation = 3 zones colorées (Fait/À reprendre/Reste à faire) | ⚠️ PARTIEL — 3 sections H2 LLM non stylisées (`handover/actions.ts:87-106`), libellés pas orientés relais | 🟠 Important |
| 5 | Dark mode (nuit) | ❌ ABSENT — clair seul, pas de `prefers-color-scheme` (`globals.css`) | 🟠 Important (shift de nuit) |
| 6 | Nav ≤ 5 onglets + FAB | ⚠️ 6 onglets (`DashboardNav.tsx:16-75`), pas de FAB | 🟡 Mineur |
| 7 | Haptique / bouton ≥88px / accusé sticky / traitement multi-étapes | ❌/⚠️ haptique absent, bouton **64px** (`AudioRecorder.tsx:281`), accusé non sticky (`ReportCard.tsx:75`), traitement mono-étape | 🟡 Polish |

**⚠️ Conflit capté :** la reco UX d'**auto-confirmation au compte à rebours** des tâches
**violerait la règle d'or n°4** (validation humaine obligatoire). Le modèle actuel à
boutons explicites (Accepter/Modifier/Rejeter, `TaskValidationCard.tsx:164`) est
**correct → on le garde**. Ne pas implémenter l'auto-confirm.

**Statuts de tâche réels :** `proposed` (« À confirmer ») → `validated` (« Active ») →
`done` (« Terminé ») / `rejected`. Modèle centré sur la validation humaine, cohérent
(diffère des libellés `a_faire/en_cours/fait` du brief — non bloquant).

**Facturation réelle :** quota de minutes (`minutes_quota` vs `minutes_used_this_period`),
plans `trial/solo/team/business`. Pas de modèle par siège → voir décision §4.

---

## 8. Direction produit (quand on reprendra le code)

Ordre logique des chantiers, alignés Route B :
1. **Onboarding qui force l'invitation + 1ʳᵉ passation reçue** (rétention n°1).
2. **Anti-collision** (`task_claims`) — combler le pilier manquant.
3. **Notifications push** (déclencheur shift + validation en attente) + accusé actionnable.
4. **Passation visuellement structurée** (3 zones colorées, libellés relais, accusé sticky).
5. **Socle conformité** (DPA + page `/conformité` + suppression données) avant 1ʳᵉ vente.
6. Dark mode (`prefers-color-scheme`) + polish capture (haptique, bouton ≥ 88px).

---

## 9. Décisions

- ✅ **Route B** — VALIDÉE par Allan (2026-06-19).
- ⏸️ **(b) Pricing** : par-siège vs quota minutes — **reporté à une session de travail
  dédiée** (Allan, 2026-06-19). À ne pas trancher d'ici là.
- ⬜ **(a) Vertical exact** dans Route B (industrie ? logistique ? santé ?) — ouvert.
- ⬜ **(c) Profondeur du socle conformité** avant la 1ʳᵉ vente — ouvert.

---

## 10. Sources principales (vérifiées)

- Grand View Research — Team Collaboration Software Market : https://www.grandviewresearch.com/industry-analysis/team-collaboration-software-market
- LSE/Protiviti (oct. 2024) — réunions improductives : https://www.lse.ac.uk/news/latest-news-from-lse/j-october-2024/more-than-a-third-of-business-meetings-are-unproductive-due-to-a-lack-of-generational-diversity
- CNIL — sanction SAN-2024-021 : https://www.cnil.fr/fr/surveillance-excessive-des-salaries-sanction-de-40-000-euros-entreprise-secteur-immobilier
- OpenAI DPA : https://openai.com/policies/data-processing-addendum/
- Anthropic DPA (analyse) : https://www.datasumi.com/blog/anthropic-dpa-gdpr-compliance
- NRR SaaS 2024 : https://www.digitalapplied.com/blog/net-revenue-retention-benchmarks-2026-saas-expansion-data
- Deloitte — downtime non planifié (à reformuler, ≠ passations) : https://www2.deloitte.com/us/en/pages/operations/articles/predictive-maintenance-and-the-smart-factory.html
