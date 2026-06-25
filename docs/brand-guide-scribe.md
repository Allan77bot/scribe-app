# Brand Guide — Scribe

> Identité visuelle **propre à Scribe**. Ce document fait foi pour tout le front.
>
> ⚠️ **Rupture nette avec la charte Atelier Klar.** Scribe n'utilise **ni** obsidienne
> `#0A0708`, **ni** bordeaux `#6E1F2C`, **ni** or `#A8804D`, **ni** ivoire `#F0E8D6`.
> Toute trace de cette palette dans le code (styles inline du dashboard) est à remplacer
> par les tokens ci-dessous. Scribe a sa propre identité : **bleu marine profond, blanc
> cassé, dégradés bleu → cyan.**

---

## 1. Plateforme de marque

**Personnalité.** Pro mais chaleureux. Efficace, jamais corporate. Scribe est l'assistant
de coordination calme et fiable qui transforme la parole en action — il rassure, il ne
jargonne pas.

**Métaphore visuelle.** L'encre et le signal. Le **marine profond** = la solidité, la
mémoire fiable, la nuit des équipes en relais. Le **cyan** = le signal vivant, la voix qui
devient action, l'accusé de lecture qui s'allume. Le **dégradé marine → cyan** est la
signature : *« de la note brute à la coordination claire ».*

**Ce que Scribe n'est pas, visuellement :** ni un dictaphone gris technique, ni un SaaS
corporate bleu-Microsoft, ni un outil sombre « gamer ». Sobre, profond, lumineux par
touches.

---

## 2. Palette

### Couleurs de marque (tokens)

| Token | Hex | Rôle |
|---|---|---|
| `--ink-900` | `#12132A` | Fond marine le plus profond (app shell, dashboard) |
| `--ink-800` | `#1A1A2E` | Fond marine principal (surfaces sombres) |
| `--ink-700` | `#222348` | Cartes / surfaces surélevées sur fond sombre |
| `--ink-600` | `#2E2F57` | Bordures sur fond sombre, états hover |
| `--cloud-50` | `#F7F8FB` | Blanc cassé — fond clair (pages publiques, modales claires) |
| `--cloud-100` | `#ECEEF5` | Blanc cassé secondaire, séparateurs sur fond clair |
| `--paper` | `#FBFBFD` | Surface carte sur fond clair |
| `--accent-cyan` | `#22D3EE` | Accent principal — CTA, focus, signal actif |
| `--accent-blue` | `#3B82F6` | Accent secondaire — liens, départ du dégradé |
| `--accent-deep` | `#4F46E5` | Accent profond (indigo) — pression/active state |

### Dégradés signature

```css
/* Dégradé de marque — boutons primaires, headers, splash */
--gradient-brand: linear-gradient(135deg, #1A1A2E 0%, #3B82F6 60%, #22D3EE 100%);

/* Dégradé d'accent — barres de progression, éléments actifs */
--gradient-accent: linear-gradient(90deg, #3B82F6 0%, #22D3EE 100%);

/* Voile de fond — derrière les écrans sombres, subtil */
--gradient-veil: radial-gradient(120% 100% at 50% 0%, #222348 0%, #12132A 70%);
```

### Sémantique (états)

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#34D399` | Confirmé, lu, terminé (coche verte) |
| `--warning` | `#FBBF24` | À confirmer, échéance proche |
| `--danger` | `#F87171` | Erreur, escalade, quota dépassé |
| `--info` | `#22D3EE` | Information neutre (= accent cyan) |

### Texte

| Token | Sur fond sombre | Sur fond clair |
|---|---|---|
| Primaire | `#F7F8FB` (`--cloud-50`) | `#12132A` (`--ink-900`) |
| Secondaire | `#A8AEC8` | `#5A5F77` |
| Désactivé / hint | `#6B708C` | `#9AA0B5` |

> **Contraste.** Toutes les paires texte/fond ci-dessus visent **WCAG AA** (≥ 4.5:1 pour le
> corps). Ne jamais signaler un état actif **par la seule opacité** (défaut actuel de la nav) :
> utiliser la couleur d'accent **et** un repère de forme (barre, point).

### Priorités de tâche (remplace les badges Atelier Klar)

| Priorité | Token | Hex |
|---|---|---|
| Haute | `--prio-high` | `#F87171` (rouge corail) |
| Moyenne | `--prio-med` | `#FBBF24` (ambre) |
| Basse | `--prio-low` | `#60A5FA` (bleu clair) |

---

## 3. Typographie

**Principe :** une seule famille, sans-serif géométrique moderne, déjà disponible sans
dépendance réseau (cohérent avec la PWA mobile-first et le `system-ui` actuel).

```css
--font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace; /* horodatages, IDs */
```

> Inter est recommandé (lisible en petit corps mobile, chiffres tabulaires pour les
> compteurs de minutes/quota). À défaut de l'embarquer, `system-ui` reste le fallback : ne
> jamais bloquer le rendu sur une police réseau.

### Échelle (mobile-first)

| Rôle | Taille / interligne | Poids |
|---|---|---|
| Display (splash, hero) | 32 / 38 px | 700 |
| Titre de page (H1) | 24 / 30 px | 700 |
| Section (H2) | 19 / 26 px | 600 |
| Sous-titre (H3) | 16 / 22 px | 600 |
| Corps | 15 / 23 px | 400 |
| Petit / méta | 13 / 18 px | 400-500 |
| Micro (labels, badges) | 11 / 14 px | 600, `letter-spacing: .04em`, majuscules |

**Règles.** Corps ≥ 15 px sur mobile. Chiffres en tabulaire pour quotas/durées. Titres
serrés (`letter-spacing: -0.01em`), micro-labels espacés. Voix active dans toute la copy
(« Marquer comme lu », pas « update read flag »).

---

## 4. Système — tokens à poser

À placer dans `src/app/globals.css` (remplace les `style={{}}` inline du dashboard) :

```css
:root {
  /* Marine */
  --ink-900:#12132A; --ink-800:#1A1A2E; --ink-700:#222348; --ink-600:#2E2F57;
  /* Clair */
  --cloud-50:#F7F8FB; --cloud-100:#ECEEF5; --paper:#FBFBFD;
  /* Accents */
  --accent-cyan:#22D3EE; --accent-blue:#3B82F6; --accent-deep:#4F46E5;
  /* Sémantique */
  --success:#34D399; --warning:#FBBF24; --danger:#F87171; --info:#22D3EE;
  /* Priorités */
  --prio-high:#F87171; --prio-med:#FBBF24; --prio-low:#60A5FA;
  /* Rayons & ombres */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-pill:999px;
  --shadow-card:0 1px 2px rgba(18,19,42,.06), 0 8px 24px rgba(18,19,42,.08);
  --shadow-glow:0 0 0 1px rgba(34,211,238,.4), 0 8px 24px rgba(34,211,238,.15);
  /* Espacement (échelle 4px) */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-6:24px; --space-8:32px;
  /* Dégradés */
  --gradient-brand:linear-gradient(135deg,#1A1A2E 0%,#3B82F6 60%,#22D3EE 100%);
  --gradient-accent:linear-gradient(90deg,#3B82F6 0%,#22D3EE 100%);
  --gradient-veil:radial-gradient(120% 100% at 50% 0%,#222348 0%,#12132A 70%);
}
```

**Rythme & formes.** Espacement sur grille de 4 px. Rayons : 8 px (inputs/badges),
12 px (cartes/boutons), 16 px (modales/feuilles). Cibles tactiles **≥ 44 px** (déjà en
place). Mobile-first strict : `overflow-x:hidden`, rien qui dépasse, contenu `max-w-md`
centré.

---

## 5. Composants

### Cartes

- Fond `--ink-700` (sombre) ou `--paper` (clair), rayon 12 px, `--shadow-card`.
- Padding 16 px. Titre H3, méta en texte secondaire.
- **Accent latéral** de 3 px en `--gradient-accent` pour les cartes « actives / à valider ».
- Pas de bordure dure sur fond sombre : séparer par `--ink-600` à 1 px ou par l'ombre.

### Boutons

| Variante | Fond | Texte | Usage |
|---|---|---|---|
| **Primaire** | `--gradient-brand` | `--cloud-50` | Action principale (Confirmer, Capturer) |
| **Secondaire** | transparent, bordure `--ink-600` | texte primaire | Action alternative |
| **Ghost** | transparent | `--accent-cyan` | Action tertiaire / liens d'action |
| **Danger** | `--danger` | `#1A1A2E` | Rejeter, supprimer |

- Hauteur 48 px (mobile), rayon 12 px, poids 600.
- **États :** hover (légère montée de luminosité), `:active` (échelle 0.98 + `--accent-deep`),
  focus (`--shadow-glow`), `disabled` (opacité 0.5, curseur interdit), **pending**
  (spinner + libellé « … »). Toujours un état de chargement sur les Server Actions.

### Inputs / zones de texte

- Fond `--ink-800` (sombre) / `--paper` (clair), bordure `--ink-600` 1 px, rayon 8 px,
  padding 12-14 px, texte 15 px (≥ 16 px iOS pour éviter le zoom auto).
- **Focus :** bordure `--accent-cyan` + halo `--shadow-glow`. Pas seulement un changement
  d'ombre par défaut navigateur.
- **Erreur :** bordure `--danger` + message court sous le champ (jamais avalée — cf.
  `NoteInput` à corriger). Label en voix active au-dessus.

### Modales / feuilles (mobile = bottom sheet)

- Sur mobile, privilégier la **feuille remontante** (bottom sheet) à la modale centrée :
  fond `--ink-800`, rayon haut 16 px, poignée 4×36 px, voile `rgba(18,19,42,.6)` en
  backdrop. Largeur pleine, `max-w-md` centré.
- Fermeture par swipe-down + bouton. Action primaire en bas, pouce-accessible.

### Badges & statuts

- Forme pilule (rayon 999 px), micro-label 11 px majuscule.
- Statut tâche : `À confirmer` (warning), `Active` (accent-blue), `Terminé` (success).
- Priorité : pastille `--prio-*` + libellé. **Jamais la couleur seule** : ajouter le mot.

### Barre de navigation basse

- Fond `--ink-900` translucide (`backdrop-filter: blur`), bordure haute `--ink-600`,
  `safe-area-inset-bottom`.
- Onglet **actif = icône + label en `--accent-cyan` + point/barre de 3 px** au-dessus.
  Inactif = texte secondaire. **Corrige le défaut « opacité seule ».**

### États vides (signature Scribe)

Jamais d'écran « rien ». Structure constante :

1. **Illustration légère** (trait fin cyan sur marine, style « encre »).
2. **Titre** court en voix active : *« Capturez votre première note »*.
3. **Une phrase** d'aide : *« Dictez ou collez un texte — Scribe en extrait les tâches. »*
4. **Un CTA primaire** (dégradé de marque).
5. Optionnel : 1-2 actions secondaires en ghost (« Inviter l'équipe »).

> Modèle Fireflies/Notion : l'empty state **est** l'onboarding. Révéler les modules
> (Tâches, Passation) au fur et à mesure qu'il y a de la matière.

### Indicateur de traitement IA

- Machine à états lisible (façon Fireflies) : `Transcription…` → `Tâches proposées` →
  `À confirmer` → `Active` → coche `--success`.
- Barre de progression en `--gradient-accent`. Toujours un libellé en langage clair, jamais
  un spinner muet.

---

## 6. Ton & copy

- **Voix active, 2e personne, présent.** « Marquez comme lu », « Scribe a proposé 3 tâches ».
- **Nommer par ce que l'utilisateur contrôle**, jamais par l'implémentation.
- **Pro mais chaleureux** : on encourage sans infantiliser. *« C'est prêt — l'équipe peut
  prendre le relais. »*
- **Honnête sur l'IA** : « Scribe **propose** » ; l'humain confirme. Aucune relance/escalade
  n'est présentée comme automatique avant validation (règle d'or n°4).
- **Pas de jargon, pas de « sanctions »** sans cadrage. Pas d'emoji décoratif dans l'UI
  (proscrit par la consigne projet — nettoyer le billing).
- **Erreurs utiles** : dire quoi faire (« Réessayez l'enregistrement »), pas un code.

---

## 7. Accessibilité & garde-fous

- Contraste **WCAG AA** minimum sur tout texte ; AAA visé sur le corps.
- État jamais signalé par la **couleur seule** ni l'**opacité seule** (forme + texte + couleur).
- Cibles tactiles ≥ 44 px. Focus visible (`--shadow-glow`) sur tout élément interactif.
- `prefers-reduced-motion` respecté (désactiver les transitions de dégradé animées).
- Mobile-first strict : tester à 360 px de large, `overflow-x:hidden`, rien qui dépasse.

---

## 8. Application — checklist de migration

1. Poser les tokens `:root` dans `globals.css`.
2. Remplacer chaque `style={{}}` inline du dashboard (palette Atelier Klar) par les tokens.
3. Unifier les pages publiques (`slate-*`) sur le même système clair (`--cloud-*`).
4. Corriger la nav basse (accent + repère de forme).
5. Standardiser boutons / inputs / cartes / empty states via les composants ci-dessus.
6. Retirer emojis du billing, nettoyer marqueurs `PHASE x DONE`.

> Le détail des priorités d'exécution est dans `docs/audit-ux-scribe.md` (Étape 4 — Quick wins).
