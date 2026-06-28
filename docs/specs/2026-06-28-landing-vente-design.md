# Spec — Landing de vente (page d'accueil `/`)

> Statut : **validé** (brainstorming 2026-06-28). Branche : `feat/landing-vente`.
> Objectif : transformer la page d'accueil — aujourd'hui une simple porte d'auth
> (logo + une phrase + deux boutons) — en **vitrine qui vend** Scribe à une PME
> en relais 3×8. Méthode copy : skills `copywriting` + `ogilvy`, relus `stop-slop`
> + `copy-editing`.

---

## 1. Objectif & cadrage

- **Concern unique** : le visuel/contenu de la landing publique. Pas de back-end,
  pas de migration, pas de table. RLS inchangée par construction.
- **Action n°1 visée** (single CTA) : « Créer mon équipe » → `/signup`.
- **Lecteur** (segmentation psychologique, pas démographique) : le chef d'équipe /
  responsable d'exploitation d'une PME où **les équipes se relaient** (3×8, 2×8,
  postes). Sa douleur : l'information se perd à la relève, des tâches passent à la
  trappe, on répète tout en réunion.
- **Promesse unique (Ogilvy)** : *Rien ne se perd entre les équipes.* Tenue par la
  mécanique réelle (validation humaine + accusés de lecture + passation).
- **Positionnement** : infrastructure de **coordination / passation**, pas un outil
  de transcription. C'est le différenciateur, il mène le message.

### Décisions de cadrage (validées par Allan)
1. **Angle** : coordination / passation (pas « magie IA », pas « gain de temps »).
2. **Visuel hero** : **mockup d'écran de l'app reconstruit en markup** (pas une
   capture d'image, pas l'illustration d'onboarding). Écran montré = **Tâches**.
3. **Structure** : **A+C** — hero → comment ça marche (3 étapes) → pourquoi (3
   piliers) → réassurance RGPD → CTA final → footer.
4. **CTA final** : sans mention « carte bancaire » (Stripe/pricing non tranchés).
5. **Honnêteté (Ogilvy + copywriting)** : **aucun faux témoignage ni chiffre
   inventé**. Pas de clients à citer aujourd'hui → la preuve = la mécanique + RGPD.

### Hors périmètre (YAGNI)
- Pas de témoignages / logos clients (on n'en a pas — on ne fabrique rien).
- Pas de section pricing (pricing non tranché).
- Pas de bannière cookies (path cookieless, déjà acté en conformité).
- Pas de blog, pas de FAQ longue, pas de vidéo (la vidéo « intro » est réservée au
  marketing, branche séparée).
- Pas de nouvel asset IA à générer : le hero est en markup.

---

## 2. Structure & copy final (figé)

Tous les textes ci-dessous sont **définitifs** (vouvoiement, voix active, FR).

### 2.0 — Header (nav)
- Marque à gauche : composant `Logo` (mark + mot-marque).
- À droite : lien **« Se connecter »** (`/login`) + bouton **« Créer mon équipe »**
  (`/signup`, style primaire pilule).
- Sticky optionnel (à trancher en implé ; par défaut **non sticky** pour rester simple).

### 2.1 — Hero
- **Tag (flag d'audience, Ogilvy)** : `Pour les équipes qui se relaient · 3×8, 2×8, postes`
- **H1 (visible)** : `Rien ne se perd entre les équipes.`
- **Sous-titre** : `Vos équipes se relaient, l'information non. Dictez vos notes de fin de poste : l'IA en sort les tâches, votre équipe valide, et la relève reçoit tout.`
- **CTA primaire** : `Créer mon équipe` → `/signup`
- **CTA secondaire** : `Voir comment ça marche` → ancre `#comment-ca-marche` (scroll
  doux, `prefers-reduced-motion` respecté).
- **Mockup app** (reconstruit en markup, voir §3) avec **légende** dessous
  (Ogilvy : la légende est 2× plus lue que le corps) :
  `L'écran Tâches : l'IA a proposé, votre équipe valide d'un geste.`

### 2.2 — Comment ça marche  *(ancre `#comment-ca-marche`)*
Eyebrow : `Comment ça marche`. Trois étapes numérotées :
1. **Dictez en fin de poste** — `Vous parlez, Scribe écoute. Pas de saisie après huit heures debout.`
2. **L'IA propose, vous validez** — `Scribe sort les tâches de votre note. Vous validez avant que rien ne parte : rien ne se déclenche sans un humain.`
3. **La relève reçoit tout** — `L'équipe suivante ouvre une passation claire. Vous voyez qui a lu, et quoi.`

### 2.3 — Pourquoi Scribe
Eyebrow : `Pourquoi Scribe`. Trois piliers (carte icône + titre + texte) :
- ✅ **Vous gardez la main** — `L'IA propose, vous décidez. Aucune relance ne part sans votre validation.`
- 🧠 **La mémoire de l'équipe** — `Tâches, accusés de lecture, rapport de passation : ce que vous dictez à 22h est là à 6h.`
- 🎙️ **Zéro friction** — `On dicte sur son téléphone en trente secondes. Pas de formation, pas de logiciel lourd.`

### 2.4 — Réassurance RGPD (bandeau)
`🇪🇺 Vos données restent en Europe. Elles ne servent jamais à entraîner l'IA.`
\+ liens **Confidentialité** (`/confidentialite`) · **Conformité** (`/conformite`).

### 2.5 — CTA final
- Titre : `Essayez sur votre prochaine relève.`
- Sous-texte : `Créez votre équipe en deux minutes.`
- Bouton : `Créer mon équipe` → `/signup`. **Fort contraste sur le fond marine** :
  blanc (texte cobalt) ou cyan d'accent — **pas** le cobalt plein (contraste
  insuffisant sur marine).

### 2.6 — Footer
Réutiliser le composant **`Footer`** existant (déjà sur la page, liens légaux en place).

---

## 3. Le mockup « écran Tâches » (reconstruit en markup)

Composant dédié, **statique**, fidèle au design system, qui imite l'écran Tâches :
- En-tête : `Tâches du poste` + compteur d'accusés `Lu par 6 / 8` (classe `.tnum`).
- 3 lignes de tâche (pastille de couleur + libellé + badge de statut) :
  | Libellé | Statut |
  |---|---|
  | Recontrôler la palette quai 3 | **Active** (validated, cyan) |
  | Commander films étirables | **À confirmer** (proposed, gris) |
  | Relève chariot élévateur n°2 | **Terminé** (done, vert) |
- **Réutiliser `components/ui/StatusBadge`** (4 statuts déjà tokenisés : proposed/
  validated/done/rejected) — pas de badge réinventé.
- Contenu **illustratif et plausible** (vocabulaire logistique), jamais présenté
  comme une donnée réelle.
- Bascule **clair/sombre automatique** via les tokens (aucune couleur en dur hors token).

---

## 4. Architecture (composants)

Découpage en petites unités sous `src/components/landing/`, assemblées par `page.tsx` :

| Fichier | Rôle |
|---|---|
| `src/app/page.tsx` | Assemble les sections (`<header>`/`<main>`/`<Footer/>`), métadonnées de page |
| `src/components/landing/LandingHeader.tsx` | Nav (logo + connexion + CTA) |
| `src/components/landing/Hero.tsx` | Tag, H1, sous-titre, 2 CTA, mockup + légende |
| `src/components/landing/AppMockup.tsx` | L'écran Tâches reconstruit (statique) |
| `src/components/landing/HowItWorks.tsx` | 3 étapes (ancre `#comment-ca-marche`) |
| `src/components/landing/Pillars.tsx` | 3 piliers |
| `src/components/landing/TrustBar.tsx` | Bandeau réassurance RGPD + liens légaux |
| `src/components/landing/FinalCta.tsx` | CTA final |
| `src/components/Footer.tsx` | **existant**, réutilisé tel quel |

> Si un composant est trivial (ex. `TrustBar`), il peut rester une sous-section
> inline de `page.tsx` — décision au moment du plan. Le seul composant non
> négociable à isoler est **`AppMockup`** (le plus de markup).

---

## 5. Exigences transverses

- **Mobile-first strict** : `overflow-x:hidden` déjà global ; rien ne dépasse à
  393px. Hero empilé sur mobile ; sur ≥ `md`, hero en 2 colonnes (texte | mockup).
- **Design system** : uniquement les tokens `globals.css` (cobalt, cyan, paper,
  marine, rayons, ombres). Aucune couleur en dur.
- **Dark mode** : tout bascule via `html[data-theme="dark"]`. Vérifier le contraste
  du CTA final (fond `secondary`) et du bandeau RGPD en sombre.
- **États interactifs** : chaque élément cliquable a `hover / focus-visible /
  active` ; `focus-visible` = anneau cobalt (déjà global). Tap ≥ 44px (boutons 48px).
- **Accessibilité** : `<h1>` **visible** (fin du `sr-only`), hiérarchie h1 → h2 par
  section, landmarks `header`/`main`/`footer`, `aria-label` sur la nav, scroll d'ancre
  respectant `prefers-reduced-motion`.
- **SEO/meta** : `<title>` + meta description propres à l'accueil (l'OG/Twitter est
  déjà géré globalement dans `layout.tsx`). Title proposé :
  `Scribe — Rien ne se perd entre les équipes`.
- **Liens** : `/signup`, `/login`, `/confidentialite`, `/conformite` (tous existants).

---

## 6. Critères de réussite (preuve avant « fait »)

- `npm run build` **vert** (la route `/` compile, même nombre de routes ± 0).
- `npm run lint` **0 erreur** (attention `react/no-unescaped-entities` : apostrophes
  échappées dans tout le copy FR).
- Test e2e Playwright `tests/e2e/landing.spec.ts` (mobile 393px + desktop) :
  - le `<h1>` « Rien ne se perd… » est **visible** ;
  - les CTA « Créer mon équipe » pointent vers `/signup` ;
  - « Voir comment ça marche » ancre vers la section ;
  - les liens RGPD pointent vers `/confidentialite` et `/conformite` ;
  - **aucun overflow horizontal** à 393px.
- Vérif visuelle clair **et** sombre (l'app lancée, ou via le compagnon).
- **Aucune** table / migration / écriture base touchée.

---

## 7. Notes

- Les **illustrations d'onboarding** (`public/illustrations/onb-*`) ne sont **pas**
  utilisées ici (réservées à l'onboarding) — le hero est en markup.
- Cette branche **empile** sur la pile `design-system → … → conformite-rgpd` (PR #8
  non mergée). C'est assumé pour avoir la landing à jour (footer conformité inclus),
  mais ça renforce l'urgence de merger #8 avant que la pile ne devienne ingérable.
- « Sans engagement » / « gratuit » volontairement **absents** tant que le modèle
  commercial n'est pas tranché.
