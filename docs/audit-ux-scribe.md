# Scribe — Audit technique, veille marché & proposition UX

> Document de travail produit par la branche `feat/audit-ux` (2026-06-14).
> Couvre : audit du code existant, veille marché (5 SaaS), étude vidéo, et une
> refonte UX en 3 niveaux (quick wins / structurel / vision).
> Le détail visuel (couleurs, composants) vit dans `docs/brand-guide-scribe.md`.

---

## ÉTAPE 1 — Audit technique

Stack constatée : **Next.js 16.2.9** (App Router, React 19), **Supabase** (`@supabase/ssr`),
**Tailwind v4**, **Stripe v22**, **OpenAI Whisper** (transcription), **Anthropic Haiku**
(extraction + synthèse), **Brevo** (SMTP REST). 5 migrations SQL. Convention code
anglais / commentaires français respectée. Mobile-first globalement respecté
(`overflow-x:hidden` partout, cibles tactiles `min-h-[44px]`, `safe-area-inset`).

### Tableau récapitulatif par zone

| Zone | Existe | Fonctionnel | Bancal / Risque |
|---|---|---|---|
| **Auth** | `lib/auth/actions.ts`, `(auth)/login`+`signup`, `proxy.ts`, `supabase/{server,client,admin,middleware}.ts` | Sessions Supabase only (règle d'or n°1 ✅), signup→trigger SQL crée org+admin, anti-énumération | Lien `/reset-password` référencé (`email/auth-links.ts:57`) mais **page inexistante** → lien mort. Pas de « renvoyer l'e-mail » côté UI |
| **Capture** | `capture/page.tsx`, `AudioRecorder.tsx`, `NoteInput.tsx`, `entries/actions.ts` | Onglets vocal/écrit, MediaRecorder + fallback mime, états idle→recorded→uploading→error, **upload par URL signée** (règle d'or n°3 ✅) | **Aucune limite de durée** d'enregistrement. `NoteInput` avale les erreurs (`catch {}`, pas de message). `minutes_used_this_period` **jamais incrémenté** → quota décoratif |
| **Pipeline IA** | `pipeline/actions.ts` (`processEntry`) | Whisper → Haiku, download via client admin (bucket privé), parse JSON défensif | **Pipeline synchrone dans `createEntry`** (`entries/actions.ts:84`) → l'utilisateur attend Whisper+Haiku avant redirect (UX longue, timeouts Vercel). **Note écrite jamais traitée** (`processEntry` lancé pour l'audio seulement) → n'apparaît jamais dans Tâches. Synthèse du soir en **Haiku** au lieu d'un modèle moyen (**viole règle d'or n°5**) |
| **Tâches** | `tasks/page.tsx`, `TaskList.tsx`, `TaskCard.tsx`, `tasks/actions.ts` | Regroupement par priorité, états vides, boutons Valider/Terminé | **`updateTask` bypasse la RLS via client admin SANS vérifier l'org** (`tasks/actions.ts:21-27`) → **trou d'isolation cross-org (viole règle d'or n°2)**. **Incohérence de statut** : UI écrit `validated`/`done`, mais le rapport teste `status === "fait"` (`reports/actions.ts:60`) → aucune tâche terminée n'est comptée. **Aucune relance/escalade n'existe** (règle d'or n°4 sans objet). Marqueur debug `PHASE 3 DONE` en prod |
| **Rapports** | `report/page.tsx`, `ReportCard.tsx`, `GenerateReportButton.tsx`, `reports/actions.ts` | `generateReport` + `markRead` + accusés de lecture, jointure noms, date FR | **`dangerouslySetInnerHTML` sur HTML généré par le LLM** (`ReportCard.tsx:54`) → **risque XSS** (aucune sanitization). `report/page.tsx` lit via client admin filtré à la main sur `org_id` (fragile). `shift_label` codé en dur `"jour"`. Bug statut `"fait"` |
| **Billing** | `billing/page.tsx`, `UpgradeButton.tsx`, `billing/actions.ts`, `api/stripe/webhook` | Checkout (admin-only), webhook signé, mapping statuts, barre d'usage | **Stripe instancié au top-level** (`billing/actions.ts:6`) → risque de casser le build Vercel (régression du fix `70d39eb`). **Pas d'idempotence webhook** (retry rejoue l'update). Emojis dans l'UI (`✅⚠️🚨💡`) — proscrits par la consigne |
| **Email/SMTP** | `email/send.ts`, `email/auth-links.ts`, `/api/auth/confirm` | Brevo REST, 3 templates, `server-only`, échec non bloquant au signup | `sendInvitationEmail` **jamais appelée** (invites absentes). Reset password : page inexistante. Échecs d'envoi silencieux (booléen, aucun signal) |
| **Navigation** | `DashboardNav.tsx`, `dashboard/layout.tsx`, `dashboard/page.tsx` (hub) | Barre basse fixe mobile-first, route active, `safe-area`, hub central, SVG inline | Actif/inactif ne changent que **l'opacité** (même couleur) → contraste faible |
| **Isolation/RLS** | Migrations 0001-0005, `current_org_id()`, policies | RLS + policy sur toutes les tables à `org_id`, storage par org, `handle_new_user` n'honore jamais un `org_id` client | **Usage massif du `service_role`** dans les Server Actions → chaque bypass doit refiltrer `org_id` à la main ; `updateTask` ne le fait PAS. `/check-rls` exigé mais le pattern admin-client le contourne par design |

### Top risques à corriger (par gravité)

1. **`updateTask` — fuite d'isolation cross-org** (`tasks/actions.ts`). Le plus grave : viole la règle d'or n°2. → repasser par la session/RLS ou `eq("org_id", …)`.
2. **Bug statut `"fait"` vs `"validated"/"done"`** → le rapport ne compte jamais les tâches terminées. Fonctionnellement cassé.
3. **Notes écrites jamais traitées** → la moitié de la capture produit des entrées fantômes.
4. **XSS via `dangerouslySetInnerHTML`** sur HTML LLM (`ReportCard.tsx`).
5. **Violations des règles d'or** : n°4 (validation→relance inexistante), n°5 (synthèse en Haiku).
6. **Quota minutes décoratif** : jamais incrémenté → pas de garde-fou de coût IA.

### Dette / qualité

- **Deux design systems coexistent** : pages publiques en `slate-*` Tailwind (clair),
  dashboard en charte sombre via **`style={{}}` inline non tokenisés**, répétés dans chaque fichier.
- Marqueurs `PHASE 3/4/5 DONE` laissés en prod (3 pages).
- Casts `as unknown as Org` partout (types Supabase non générés).
- Racine du repo polluée par des scripts hors-sujet non ignorés, dont `.firecrawl_key`
  (**secret en clair non gitignoré**).

> **Verdict.** Le squelette fonctionnel des 5 modules existe et la sécurité de base
> (sessions, RLS, URL signées) est posée. Mais **3 bugs cassent le parcours de bout en
> bout** (statut « fait », notes écrites, isolation `updateTask`) et **le design n'est
> pas un système** — c'est précisément là que l'effort UX paie.

---

## ÉTAPE 2 — Veille marché (5 SaaS, 2025-2026)

Apps étudiées : **Notion AI, Fireflies.ai, Otter.ai, Grain, Loom**. Synthèse des
patterns gagnants directement transposables à Scribe (détail des sources conservé en annexe de session).

| Pattern gagnant | Référence | Pourquoi ça marche | Applicabilité Scribe |
|---|---|---|---|
| **Empty state = onboarding** (Quick Start 2-3 CTA, jamais d'écran vide) | Fireflies, Notion | Convertit le vide en première action ; révèle les features quand il y a de la matière | **Très haute** : 1er écran = « Dicter » / « Coller un texte » / « Inviter » |
| **Anti-blank-state : l'objet existe pré-nommé dès le tap** | Otter (note « Note » par défaut) | Réduit la friction du premier geste | **Haute** : tap micro → note datée « Note 14:32 » immédiate |
| **Transcription live qui défile + résumé concurrent** | Otter, Notion | Feedback immédiat = confiance dès la 1re seconde | **Haute** (cœur produit) |
| **Preview + Accept / Discard / Retry inline avant engagement** | Notion AI | L'IA propose, l'humain dispose, sans modale | **Critique** = traduction directe de la **règle d'or n°4** |
| **Machine à états explicite + langage clair + coche verte + notif** | Fireflies (8 statuts) | Rend l'asynchrone IA lisible ; pose l'étape « à valider » | **Critique** : Transcription → **À confirmer** → Active → Terminé |
| **Accusé de lecture chiffré et objectif** (≥5 s / 75 % / fin), nom, notif 1re vue | Loom (Viewer Insights) | Définition non ambiguë du « vu » | **Critique** = cœur des accusés de lecture Scribe |
| **Surligner un fragment → le promouvoir en objet** | Grain (→ Clip), Otter (→ action item) | Geste atomique flux→livrable assignable | **Très haute** : surligner une phrase → créer une tâche |
| **Agréger des fragments en un objet partageable** | Grain (Stories) | Compresse 1h en 3 min, visibilité par équipe | **Haute** = le rapport de passation |
| **Objet partageable instantané, zéro étape** | Loom (auto-copie presse-papiers) | Supprime la friction « fini → reçu » | **Haute** : Web Share API mobile en fin de note |
| **⌘K / barre unique recherche + chat IA sourcé** | Otter, Notion, Grain | Un point d'entrée, réponses citées | **Moyenne-haute** : « Demander à Scribe » scoppé `org_id` |
| **Nav à onglets pensée « taps to task » mobile** | Notion, Fireflies | Accès direct sans dérouler de menu | **Haute** (barre basse déjà en place) |
| **Aha = produire ET faire consommer une fois ; paywall différé** | Loom (1re vidéo vue en 7 j) | Active sur la valeur reçue, pas la feature | **Haute** : aha = note → tâche validée → 1er accusé de lecture |

---

## ÉTAPE 3 — Étude vidéo

**Vidéo cible :** `https://youtu.be/j5bDA7cE-1k` → **« Créer un SaaS : Ce que personne
ne te dit sur le Vibe Coding »**, par **Amadou Fall** (@AmadouFinances), ~95 800 vues,
publiée il y a 1 mois.

> ⚠️ **Transparence sur la méthode.** La consigne prévoyait « yt-dlp + Gemini ». Dans cet
> environnement : **aucune clé Gemini** disponible, et surtout **YouTube bloque l'IP du
> serveur** (datacenter → « Sign in to confirm you're not a bot »). J'ai épuisé ~13 voies
> de contournement (yt-dlp multi-clients, Invidious/Piped, Cobalt, DownSub, NoteGPT,
> Tactiq, Jina Reader, timedtext direct, oEmbed) : toutes échouent (IP bloquée, captions
> proxifiées vides faute de POT token, APIs sous auth). **La transcription verbatim n'a pas
> pu être récupérée.** Identité, auteur, sujet et popularité sont, eux, **vérifiés** (oEmbed
> + Jina Reader + recherche web). Je ne fabrique donc pas de « citations » de la vidéo.

**Écart de cadrage à signaler.** La consigne supposait une vidéo de **principes UX**. La
vidéo réelle porte sur le **vibe coding d'un SaaS** (Amadou Fall a lancé 4 SaaS en 4 mois
et vend une formation de 7 h sur la méthode). Les enseignements applicables relèvent donc
de la **construction/mise en marché d'un SaaS au vibe coding**, pas de l'ergonomie pure.
Voici ce qui s'applique directement à Scribe, **étiqueté comme inférence du sujet confirmé
de la vidéo et du genre, et non comme transcription** :

1. **« Ce que personne ne te dit » = la dette du vibe coding.** Le code généré vite cache
   des trous (sécurité, isolation). → Scribe le vit déjà : `updateTask` qui bypasse la RLS
   est exactement ce piège. Leçon : **la vitesse de génération ne dispense pas de l'audit
   sécurité** — d'où la valeur de `/check-rls` et de cet audit.
2. **Valider le marché avant de polir.** Le vibe coding sert à atteindre vite un produit
   testable. → Pour Scribe : viser **une boucle de valeur démontrable** (note → tâche → accusé
   de lecture) plutôt que de compléter les 8 modules.
3. **Le différenciateur, pas la commodité.** Tout le monde transcrit ; peu coordonnent.
   → Aligne avec la mission : le centre de gravité est la **coordination active**.
4. **Coût IA = marge.** Un SaaS au vibe coding meurt si l'IA coûte plus que le prix payé.
   → C'est la règle d'or n°5 (stack hybride) + le quota minutes **à brancher réellement**.
5. **Onboarding = survie.** Un SaaS solo se juge sur l'activation des premiers users.
   → D'où l'importance des empty states et de l'aha moment (étape 4).

> Si l'accès à la transcription devient possible (clé Gemini, cookies YouTube, ou exécution
> depuis une IP résidentielle), cette section pourra être complétée par les principes
> exacts énoncés dans la vidéo. En l'état, elle reste **honnête sur ses limites**.

---

## ÉTAPE 4 — Proposition UX (3 niveaux)

### Niveau 1 — Quick wins (≤ 2 h, livrables ce soir)

Améliorations à fort ratio impact/effort, sans refonte d'architecture :

1. **Tokeniser la charte** dans `globals.css` (variables CSS Scribe — cf. brand guide) et
   remplacer les `style={{}}` inline du dashboard par des classes utilitaires. Unifie les
   deux design systems et débloque tout le reste.
2. **Corriger le contraste actif/inactif de la nav basse** (`DashboardNav.tsx`) : l'onglet
   actif prend la couleur d'accent (cyan), pas seulement +opacité.
3. **Empty states utiles** partout (Tâches, Rapport, hub) : titre + 1 phrase + 1 CTA, au
   lieu d'un écran « rien ». Modèle Fireflies/Notion.
4. **Feedback sur `NoteInput`** : afficher l'erreur au lieu de l'avaler (`catch {}`).
5. **Retirer les marqueurs `PHASE 3/4/5 DONE`** et les **emojis du billing** (proscrits).
6. **Gitignorer `.firecrawl_key`** + sortir les scripts hors-sujet de la racine (hygiène).
7. **État de traitement lisible** sur la capture : « Transcription… » → « Tâches proposées »
   avec coche verte (machine à états Fireflies, version light).

> Ces 7 items sont cosmétiques/sûrs et ne touchent ni la base ni la sécurité — parfaits
> pour un commit « ce soir ». **Note :** les 3 bugs durs (statut « fait », notes écrites,
> `updateTask`) sont fonctionnels/sécurité, **hors périmètre UX** mais à traiter en priorité
> dans une branche dédiée (`fix/*`).

### Niveau 2 — Structurel (1-2 jours, navigation + flows)

1. **Flow de capture « anti-blank-state » (Otter)** : un tap → note pré-nommée datée →
   transcription qui défile en direct → écran de **proposition de tâches** (cartes).
   Rendre le **pipeline asynchrone** (sortir Whisper/Haiku de `createEntry`) avec statut live.
2. **Boucle de validation humaine (Notion : Accept/Modifier/Rejeter)** sur chaque tâche
   extraite, **avant** que le timer démarre. C'est la matérialisation UX de la règle d'or n°4
   et la pièce qui manque le plus au produit.
3. **Tâche depuis fragment (Grain/Otter)** : surligner une phrase de la transcription →
   créer une tâche (owner + échéance auto-suggérés, validés d'un tap).
4. **Rapport de passation comme « Story » (Grain)** : agrégation auto des tâches/décisions du
   jour en un objet unique, **partage instantané** (Web Share API) + **accusé de lecture
   chiffré (Loom)** : « lu » = ouvert + scroll bas, ou bouton « Pris en compte », nom de
   l'agent, notif au dirigeant à la 1re lecture.
5. **Onboarding orienté aha** : définir l'activation = **1re note → 1re tâche validée → 1er
   accusé de lecture par un coéquipier**. Paywall **après** cette boucle (Loom).
6. **Barre basse clarifiée** : Capturer / Tâches / Passation / Équipe.

### Niveau 3 — Vision (direction produit)

- **Scribe = la couche de coordination, pas le dictaphone.** Tout l'UI doit pousser de la
  capture vers *« qui fait quoi, qui sait quoi »*. La transcription est un moyen, jamais la
  destination.
- **Le relais 3×8 comme terrain différenciant (Route B).** Un mode « passation » dédié :
  à la prise de poste, *« ce qu'il faut savoir depuis le dernier passage »* (résumé concurrent
  façon Otter, adapté aux équipes successives) + **anti-collision** (`task_claims` : qui est
  déjà sur une tâche).
- **« Demander à Scribe » (⌘K) sourcé et cloisonné** : un point d'entrée unique qui interroge
  l'historique de l'org (strictement `org_id`), répond **avec citation de la note source**.
- **Confiance par conception** : toute action IA (relance, escalade) est **attribuée,
  traçable et déclenchée seulement après validation humaine** — argument de vente B2B/RGPD
  et cohérence avec les règles d'or.
- **Résidence UE + sobriété IA** comme promesse de marque (mini pour transcrire/extraire,
  modèle moyen 1×/jour) : différenciateur face aux concurrents US, et marge saine.

---

## Recommandations prioritaires (synthèse)

Voir le résumé final de la session (10 lignes). Le détail visuel pour exécuter les quick
wins se trouve dans **`docs/brand-guide-scribe.md`**.
