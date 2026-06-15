# Professional Flow — Spécification de design

> Document de référence pour Hermes. Application de **communication et transcription business**.
> Objectif : une interface *Corporate Modern* + *Soft Minimalism* — claire, rapide à lire, fiable et apaisante.
> Toutes les valeurs ci-dessous sont la source de vérité. En cas de doute, suivre les **tokens** (section 2).

---

## 1. Identité & principes

L'application aide des professionnels à enregistrer, transcrire et naviguer dans des conversations. La densité d'information est forte ; le design doit la rendre **respirable**.

Trois principes directeurs :

1. **Clarté avant décoration** — hiérarchie typographique nette, beaucoup de blanc, jamais de bordures à fort contraste.
2. **Approche « nuages superposés »** — les cartes et surfaces flottent au-dessus d'un fond légèrement teinté, avec des ombres douces et diffuses.
3. **Le bleu guide l'œil** — palette monochrome bleue ; les accents vifs signalent l'action et l'élément actif (segment lu, waveform, boutons primaires).

Personnalité : professionnelle mais accessible. Le bleu profond installe l'autorité et la confiance ; le bleu ciel injecte de l'énergie.

---

## 2. Tokens de couleur

Deux niveaux coexistent. Les **couleurs de marque** expriment l'intention ; les **tokens système** (style Material) sont les valeurs exactes à implémenter.

### 2.1 Couleurs de marque (intention)

| Rôle | Hex | Usage |
|------|-----|-------|
| Primary — *Action Blue* | `#007BFF` | Boutons primaires, états actifs, waveform active, infos critiques |
| Secondary — *Deep Navy* | `#002B5B` | Titres, texte fort contraste, ombres teintées |
| Tertiary — *Soft Azure* | `#E9F2FF` | Fonds de conteneurs subtils, états hover, fonds d'icônes |
| Neutral — *Cloud Grey* | `#F4F7FA` | Fond principal de l'app, champs de saisie |

Les couleurs fonctionnelles (succès, alerte, erreur) sont utilisées avec parcimonie : le flux standard reste bleu.

### 2.2 Tokens système (valeurs exactes)

Surfaces

| Token | Hex |
|-------|-----|
| `surface` / `background` | `#f7fafd` |
| `surface-dim` | `#d7dadd` |
| `surface-bright` | `#f7fafd` |
| `surface-container-lowest` | `#ffffff` |
| `surface-container-low` | `#f1f4f7` |
| `surface-container` | `#ebeef1` |
| `surface-container-high` | `#e5e8eb` |
| `surface-container-highest` | `#e0e3e6` |
| `surface-variant` | `#e0e3e6` |

Texte sur surfaces

| Token | Hex |
|-------|-----|
| `on-surface` / `on-background` | `#181c1e` |
| `on-surface-variant` | `#414754` |
| `inverse-surface` | `#2d3133` |
| `inverse-on-surface` | `#eef1f4` |
| `outline` | `#717786` |
| `outline-variant` | `#c1c6d7` |

Primary

| Token | Hex |
|-------|-----|
| `primary` | `#0059bb` |
| `on-primary` | `#ffffff` |
| `primary-container` | `#0070ea` |
| `on-primary-container` | `#fefcff` |
| `inverse-primary` | `#adc7ff` |
| `surface-tint` | `#005bc0` |
| `primary-fixed` | `#d8e2ff` |
| `primary-fixed-dim` | `#adc7ff` |
| `on-primary-fixed` | `#001a41` |
| `on-primary-fixed-variant` | `#004493` |

Secondary

| Token | Hex |
|-------|-----|
| `secondary` | `#405f91` |
| `on-secondary` | `#ffffff` |
| `secondary-container` | `#a6c5fe` |
| `on-secondary-container` | `#315182` |
| `secondary-fixed` | `#d6e3ff` |
| `secondary-fixed-dim` | `#a9c7ff` |
| `on-secondary-fixed` | `#001b3d` |
| `on-secondary-fixed-variant` | `#264778` |

Tertiary

| Token | Hex |
|-------|-----|
| `tertiary` | `#545d67` |
| `on-tertiary` | `#ffffff` |
| `tertiary-container` | `#6c7581` |
| `on-tertiary-container` | `#fdfcff` |
| `tertiary-fixed` | `#dae3f0` |
| `tertiary-fixed-dim` | `#bec7d4` |
| `on-tertiary-fixed` | `#131c25` |
| `on-tertiary-fixed-variant` | `#3f4852` |

Erreur

| Token | Hex |
|-------|-----|
| `error` | `#ba1a1a` |
| `on-error` | `#ffffff` |
| `error-container` | `#ffdad6` |
| `on-error-container` | `#93000a` |

> **Note d'implémentation** : les couleurs de marque 2.1 et les tokens 2.2 sont volontairement proches mais pas identiques (le `primary` système `#0059bb` est légèrement plus profond que l'Action Blue `#007BFF`). Pour le code, **utiliser les tokens système 2.2**. Réserver les hex de marque 2.1 aux maquettes/illustrations et aux décisions de contenu.

---

## 3. Typographie

Police unique : **Manrope** (pureté géométrique, excellente lisibilité du gros titre au corps dense). Charger les graisses 400 / 500 / 600 / 700 / 800.

| Style | Famille | Taille | Graisse | Interligne | Letter-spacing |
|-------|---------|--------|---------|-----------|----------------|
| `display-lg` | Manrope | 32px | 800 | 40px | -0.02em |
| `headline-lg` | Manrope | 24px | 700 | 32px | — |
| `headline-md` | Manrope | 20px | 700 | 28px | — |
| `body-lg` | Manrope | 18px | 500 | 28px | — |
| `body-md` | Manrope | 16px | 400 | 24px | — |
| `body-sm` | Manrope | 14px | 400 | 20px | — |
| `label-md` | Manrope | 12px | 600 | 16px | 0.05em |
| `transcript-focus` | Manrope | 22px | 700 | 30px | — |

Règles d'usage :

- **Titres** : graisses semi-bold/bold, couleur `secondary` (Deep Navy) pour une architecture d'information nette.
- **Corps long** : `on-surface` / version désaturée du navy pour un confort de lecture prolongée.
- **`transcript-focus`** : style dédié au segment en cours de lecture — couleur `primary` + taille augmentée pour guider l'œil dans la transcription.
- **`label-md`** : réservé aux étiquettes, statuts et métadonnées (majuscules optionnelles, tracking 0.05em).

---

## 4. Layout & espacement

Modèle **Fluid-Fixed Hybrid** : le conteneur peut s'étirer, mais les blocs de contenu gardent un rythme structuré sur une grille de **8px**.

Tokens d'espacement

| Token | Valeur |
|-------|--------|
| `base` | 8px |
| `xs` | 4px |
| `sm` | 12px |
| `md` | 20px |
| `lg` | 32px |
| `xl` | 48px |
| `gutter` | 16px |
| `container-margin` | 24px |

Règles :

- **Marges** : mobile = marge de sécurité 24px ; desktop = conteneur centré, largeur max **1200px**.
- **Rythme vertical** : grandes sections séparées par 32px (`lg`) ou 48px (`xl`) pour éviter l'encombrement.
- **Densité** : les vues de transcription utilisent un padding `md` (20px) — haute densité sans sacrifier la lisibilité.

---

## 5. Rayons (formes)

Langage de formes **pilule** et **très arrondi** = convivialité et modernité.

| Token | Valeur |
|-------|--------|
| `sm` | 0.5rem (8px) |
| `DEFAULT` | 1rem (16px) |
| `md` | 1.5rem (24px) |
| `lg` | 2rem (32px) |
| `xl` | 3rem (48px) |
| `full` | 9999px |

Application :

- **Conteneurs principaux / cartes** : rayon minimum **32px** (`lg`) pour une silhouette douce.
- **Boutons & chips** : pilule complète (`full`) ou minimum 16px.
- **Champs de saisie** : 16px (`DEFAULT`).
- **Avatars** : toujours circulaires — élément humanisant face aux données structurées.

---

## 6. Élévation & profondeur

Profondeur organisée par **couches tonales** + **ombres ambiantes**. Jamais de bordures à fort contraste.

| Niveau | Surface | Ombre |
|--------|---------|-------|
| **0 — Fond** | `surface` `#f7fafd` (fill plein) | aucune |
| **1 — Cartes** | blanc `#ffffff` | `0px 10px 30px rgba(0, 43, 91, 0.05)` |
| **2 — Modales actives** | blanc `#ffffff` | `0px 20px 50px rgba(0, 43, 91, 0.12)` |

- **Profondeur interactive** : au survol, les boutons et cartes cliquables font un léger *lift* ou un inner-glow subtil — jamais une bordure marquée.
- L'ombre est toujours teintée navy (`rgba(0,43,91,…)`), jamais noir pur.

---

## 7. Composants

### 7.1 Boutons

- **Primary** : fond `primary` plein, texte blanc, forme pilule, hauteur **56px** pour les actions principales.
- **Secondary** : fond Tertiary/azure (`tertiary-container` clair ou `#E9F2FF`), texte `primary`, **sans bordure**.
- **Icon button** : circulaire, fond azure, icône 24px en `primary`.

### 7.2 Cartes

- Toujours blanc, rayon **32px**, padding **24px** constant.
- Séparateurs internes de liste : trait bleu clair 1px, ~5% d'opacité.

### 7.3 Inputs & recherche

- Fond `surface` / Neutral `#F4F7FA`, **sans bordure**, rayon 16px.
- Icône à gauche, alignée, en `primary`.

### 7.4 Waveform & lecteur audio

- Barres **actives** : `primary` (Action Blue).
- Barres **inactives / fond** : azure (Tertiary).
- Bouton play central : cercle **64px** avec drop shadow subtile.

### 7.5 Indicateurs de statut

- **Non lu / actif** : petit point circulaire en `primary`.
- **Enregistré / terminé** : étiquette gris doux avec accent d'icône azure.

---

## 8. Spécifications écran par écran

Les écrans ci-dessous appliquent les tokens précédents. Adapter le nombre exact d'éléments au contenu réel.

### 8.1 Liste des enregistrements / boîte de réception

Objectif : parcourir rapidement les conversations transcrites.

- **Header** : titre en `headline-lg` (`secondary`), à droite un icon button azure (filtre/nouveau).
- **Barre de recherche** (section 7.3) sous le header, pleine largeur, marge `container-margin`.
- **Liste de cartes** : une carte blanche par enregistrement, rayon 32px, padding 24px, espacées de `gutter` (16px).
  - Avatar circulaire à gauche (interlocuteur).
  - Titre `body-lg` + ligne de métadonnées `body-sm` en `on-surface-variant` (date, durée).
  - Point bleu `primary` si non lu ; sinon étiquette « Terminé » en gris doux.
  - Mini-waveform ou durée à droite.
- **Fond** : `surface`. Les cartes flottent (élévation niveau 1).
- **FAB / action principale** : bouton primary pilule « Nouvel enregistrement », 56px, ancré en bas (mobile) ou dans le header (desktop).

### 8.2 Lecteur + transcription (écran clé)

Objectif : écouter et suivre la transcription synchronisée.

- **En-tête de conversation** : titre `headline-md` (`secondary`), avatars circulaires des participants, métadonnées `label-md`.
- **Lecteur audio** (carte blanche, élévation 1, padding `md` 20px) :
  - Waveform pleine largeur — barres actives `primary`, inactives azure.
  - Bouton play central circulaire **64px** avec drop shadow ; contrôles secondaires (±15s, vitesse) en icon buttons azure.
  - Timecode courant / total en `body-sm`.
- **Transcription** : liste de segments.
  - Segment courant en **`transcript-focus`** (22px/700, couleur `primary`) — met en avant la portion lue.
  - Autres segments en `body-md` (`on-surface`), libellé du locuteur en `label-md`.
  - Padding de vue `md` (20px), séparateurs bleu clair 5%.
  - Auto-scroll doux pour garder le segment actif visible.
- **Actions** : partager / exporter / copier en boutons secondary azure.

### 8.3 Enregistrement en cours

Objectif : capter avec un retour visuel rassurant.

- Fond `surface`, grande carte centrale blanche (élévation 1).
- **Waveform live** animée en `primary`, centrée.
- **Timer** en `display-lg` (`secondary`).
- Bouton stop circulaire 64px (accent `error` réservé à l'arrêt, sinon `primary`).
- État « transcription en direct » optionnel : texte qui apparaît en `body-md`, segment courant en `transcript-focus`.

### 8.4 Recherche

Objectif : retrouver un passage à travers toutes les transcriptions.

- Champ de recherche proéminent (section 7.3) en haut, icône `primary` à gauche.
- Résultats en cartes : extrait avec le terme recherché surligné en azure, titre de la conversation en `body-lg`, contexte en `body-sm`.
- Filtres en chips pilule (date, locuteur, statut) — actif = fond `primary`/texte blanc, inactif = azure/texte `primary`.

### 8.5 Détail / paramètres d'un enregistrement

- Carte d'en-tête blanche : titre éditable `headline-md`, participants (avatars circulaires), tags en chips.
- Sections (export, langue, partage, suppression) en lignes de liste avec séparateurs bleu clair.
- Action destructive (supprimer) : texte `error`, jamais mise en avant visuelle agressive.

---

## 9. Récapitulatif rapide pour Hermes

- **Police** : Manrope partout.
- **Fond app** : `#f7fafd` ; **cartes** : blanc `#ffffff`, rayon **32px**, padding **24px**.
- **Couleur d'action** : `primary` `#0059bb` (intention Action Blue `#007BFF`).
- **Titres** : `secondary` Deep Navy.
- **Ombres** : douces, teintées navy `rgba(0,43,91,…)`, jamais de bordures fortes.
- **Boutons** : pilule, primary 56px de haut.
- **Grille** : 8px ; conteneur desktop max 1200px ; marge mobile 24px.
- **Signature produit** : le **segment de transcription actif** en `transcript-focus` + couleur `primary`, synchronisé avec la **waveform**.
