# Spec — Images de bienvenue (Open Graph + onboarding)

> Conçu le 2026-06-27 (brainstorming). Branche : `feat/welcome-images`
> (depuis `fix/failles-securite-high`). **Aucune table, aucune RLS, aucune
> migration** — chantier 100 % front + assets, zéro risque base.

## Objectif

Soigner la **première impression** de Scribe sur deux surfaces aujourd'hui nues :

1. **Open Graph** — l'aperçu riche affiché quand on **partage un lien** Scribe
   (LinkedIn, SMS, cold email, accueil). Aujourd'hui : **aucune** balise `og:*`
   → aperçu nu, fait amateur. Levier de **vente** direct.
2. **Onboarding** — les écrans émotionnels du wizard (accueil + « Prêt ») n'ont
   que des **emojis** (👋 / 🚀) dans un cercle de 64px. On les remplace par de
   vraies **illustrations de bienvenue**. Levier **rétention**.

## Décisions (toutes validées avec Allan)

| Sujet | Décision |
|---|---|
| Périmètre | **Les deux** : OG + illustrations onboarding |
| Fabrication | **Hybride** : OG dessinée en code ; onboarding illustré par IA |
| Placement onboarding | Bandeau héro (~180px) sur **accueil** + **Prêt** ; le mini-tour garde ses icônes SVG |
| Style illustrations | **Flat géométrique de marque** (cobalt `#2A4FB0` / cyan `#22D3EE` / paper `#f8f7f4`) |
| Dark mode | **Fond de bandeau fixe de marque** → une seule image par écran, marche en clair ET sombre |
| Portée OG | **Carte de marque unique** (pas d'aperçu d'invitation personnalisé pour l'instant) |
| Positionnement slogan | Mène avec **le but de l'app** (IA + coordination), pas la passation (gardée comme angle marketing ultérieur) |

---

## A. Carte Open Graph (dessinée en code)

### Contenu de la carte (1200×630)

- Fond : dégradé **cobalt → marine**, forme/accent **cyan** en signature.
- Logo : `public/logos/scribe-logo-white-cyan.png` (lockup blanc + cyan).
- **Titre :** *Scribe*
- **Slogan :** « L'IA transforme vos notes en tâches suivies pour l'équipe. »
- **Sous-ligne :** « Dictez, l'IA extrait et suit — rien ne se perd. »

### Implémentation

- **`src/app/opengraph-image.tsx`** — convention de fichier Next : exporte
  `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, `alt`, et
  un composant par défaut rendant une `ImageResponse` (`next/og`, moteur Satori).
  Next câble **automatiquement** les balises `<meta property="og:image">`.
- **`src/app/twitter-image.tsx`** — re-export du même rendu (carte
  `summary_large_image`).
- **`src/app/layout.tsx`** — ajouter à `metadata` :
  - `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://scribe-app-beta.vercel.app")`
  - bloc `openGraph` : `title`, `description`, `siteName: "Scribe"`,
    `locale: "fr_FR"`, `type: "website"`, `url: "/"`.
  - bloc `twitter` : `card: "summary_large_image"`, `title`, `description`.
- **Police & logo dans Satori** (le piège classique) :
  - Charger Manrope (SemiBold + Bold/ExtraBold) en `.ttf` **colocalisés** dans le
    repo, lus via `fetch(new URL("./Manrope-Bold.ttf", import.meta.url)).then(r => r.arrayBuffer())`
    (tracé correctement par Next — plus robuste que `process.cwd()`).
  - Logo : lu de la même façon (`import.meta.url`) puis passé à `<img>` en **data
    URI base64** (Satori n'accède pas au filesystem ; éviter de fetch sa propre URL).
  - Polices `.ttf` à ajouter sous `src/app/` (p. ex. `src/app/_og/`).

### Vérification OG

- `GET http://localhost:3000/opengraph-image` renvoie une image PNG valide.
- Inspection visuelle du PNG (lisibilité du slogan, logo net, marges).
- Après déploiement : validateur d'aperçu (opengraph.xyz ou équivalent).

---

## B. Illustrations héro d'onboarding (IA, Higgsfield)

### Les visuels

Deux illustrations **flat géométriques**, palette cobalt / cyan / paper, **sans
aucun texte** (règle anti-déformation IA) :

1. **`onboarding-welcome.png`** (partagée manager + employé) — motif de
   **coordination d'équipe** : silhouettes simples reliées, onde vocale qui se
   change en cartes de tâches / coches. Ton chaleureux, optimiste.
2. **`onboarding-ready.png`** (écran « Prêt ») — motif **« c'est lancé »** :
   élan géométrique vers le haut, coche / drapeau, signal de départ.

- Ratio généré ~16:9, recadré en bandeau (`object-cover`).
- Stockées dans **`public/illustrations/`**, servies via `next/image`.
- **Génération via MCP Higgsfield**, en **boucle de validation avec Allan** :
  je propose plusieurs variantes, Allan tranche, on fige la retenue.

### Dark mode (sans double jeu d'images)

Chaque bandeau est posé sur un **fond fixe de marque** (léger dégradé
cobalt/paper, **identique en clair et en sombre**). L'illustration est générée
sur un fond assorti (ou détourée) pour un raccord invisible → **une seule image
par écran**, valable dans les deux thèmes.

### Implémentation

- **`src/components/OnboardingHero.tsx`** (nouveau) — bandeau full-bleed en tête
  de carte : fond de marque fixe + `next/image` (`fill`, `object-cover`), hauteur
  ~180px, coins hauts arrondis (`rounded-t-card`), `overflow-hidden`. Props :
  `src`, `alt`. Plein cadre dans la carte via `-mx-6 -mt-6 mb-4`
  (la carte parente est `rounded-card p-6`).
- **`src/components/OnboardingWizard.tsx`** — 3 points de montage, **logique
  inchangée** :
  - `step 0` / `role admin` (accueil manager) → bandeau **welcome** (retire le 👋 inline).
  - `step 0` / `role member` (accueil employé) → bandeau **welcome** (retire le cercle 👋).
  - `step 3` (écran « Prêt ») → bandeau **ready** (retire le cercle 🚀).
- **`src/components/OnboardingTour.tsx`** — **inchangé** (garde ses 3 icônes SVG).

### Vérification onboarding

- Inspection visuelle des écrans accueil + Prêt en **clair ET sombre**, mobile
  **393px**, **zéro overflow horizontal** (règle mobile-first stricte).
- Parcours manager ET employé (les deux voient le bandeau welcome).
- `prefers-reduced-motion` : les animations existantes restent respectées.

---

## C. Vérification globale

- `npm run build` **vert** (nombre de routes inchangé, +1 route OG générée).
- `npm run lint` **vert**.
- Pas de `check:rls` requis (aucune table touchée).

## Hors périmètre (YAGNI)

- Aperçu d'invitation **personnalisé** (`/invite/accept?token=`) — reporté
  (lecture du token côté route OG = complexité ; angle plus tard).
- Illustrations IA pour le **mini-tour** — ses icônes SVG sont déjà raccord.
- Refonte du wizard au-delà des 3 points de montage des bandeaux.

## Fichiers touchés (récap)

**Créés :**
- `src/app/opengraph-image.tsx`
- `src/app/twitter-image.tsx`
- `src/app/_og/Manrope-*.ttf` (polices pour Satori)
- `src/components/OnboardingHero.tsx`
- `public/illustrations/onboarding-welcome.png`
- `public/illustrations/onboarding-ready.png`

**Modifiés :**
- `src/app/layout.tsx` (metadataBase + openGraph + twitter)
- `src/components/OnboardingWizard.tsx` (3 bandeaux à la place des emojis)
