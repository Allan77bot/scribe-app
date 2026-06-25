# Frontend — Scribe IA

> Spécifications UI/UX pour les agents de build et de design. Source de vérité
> visuelle : `DESIGN.md` (« Professional Flow »). Lu par les agents Explore et
> Build de Claude Code. Code en anglais, commentaires en français.

## Stack

- **Next.js 16** App Router, React 19, TypeScript strict.
- **Tailwind v4** CSS-first : tokens dans `@theme` (`src/app/globals.css`).
  **Pas de `tailwind.config.ts`** — tout vit dans le bloc `@theme`.
- **Manrope** chargée via `next/font/google` (`src/app/layout.tsx`), graisses
  400/500/600/700/800, exposée en `--font-manrope` → `font-sans`.
- **Server Components par défaut**. `"use client"` seulement si interactivité.

```bash
npm run dev            # http://localhost:3000
npm run lint           # eslint (doit être vert)
npm run build          # next build — 20+ routes, doit passer avant tout commit
```

## Tokens de design (générés depuis `@theme`, cf. `DESIGN.md` §2.2)

| Rôle | Classe Tailwind | Valeur |
|------|-----------------|--------|
| Fond app | `bg-surface` | `#f7fafd` |
| Carte | `bg-surface-container-lowest` (= blanc) | `#ffffff` |
| Champ de saisie | `bg-surface-container-low` | `#f1f4f7` |
| Nav / conteneur | `bg-surface-container` | `#ebeef1` |
| Titre | `text-secondary` (Deep Navy) | `#002b5b` |
| Corps | `text-on-surface` | `#181c1e` |
| Texte secondaire | `text-on-surface-variant` | `#414754` |
| Hint / inactif | `text-outline` | `#717786` |
| Séparateur discret | `border-outline-variant` | `#c1c6d7` |
| Action primaire | `bg-primary text-on-primary` | `#0059bb` |
| Action secondaire | `bg-azure text-on-azure` | `#e9f2ff` |
| Erreur | `text-error bg-error-container` | `#ba1a1a` |

Rayons : `rounded-field` (16px), `rounded-card` (32px), `rounded-pill` (9999px).
Ombres : `shadow-card` (cartes), `shadow-modal` (modales) — teintées navy, jamais
de bordure forte.

## Patterns obligatoires

- **Mobile-first strict** — base 360px, `overflow-x:hidden`, rien qui dépasse.
- **Server Components par défaut** ; `"use client"` uniquement si état/handlers.
- **Jamais de `style={{}}` inline** — tout en classes Tailwind / tokens.
- **Jamais de bordure à fort contraste** — profondeur via `shadow-card`.
- **Aucun thème dark** — projet 100% clair (`#f7fafd`).

## Composants canoniques (copier-coller)

```tsx
// Carte standard — blanc, rayon 32px, padding 24px, ombre douce navy
<div className="rounded-card bg-surface-container-lowest p-6 shadow-card">…</div>

// Bouton primary — pilule, hauteur 56px (h-14), texte blanc
<button className="h-14 rounded-pill bg-primary px-6 font-semibold text-on-primary">
  Marquer comme lu
</button>

// Bouton secondary — azure, sans bordure
<button className="h-14 rounded-pill bg-azure px-6 font-medium text-on-azure">
  Modifier
</button>

// Input — fond clair, sans bordure, rayon 16px
<input className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base" />

// Empty state — toujours utile, pas juste « aucune donnée »
<div className="flex flex-col items-center gap-4 py-12 text-center">
  <p className="font-semibold text-secondary">Aucune tâche à valider</p>
  <p className="text-sm text-on-surface-variant">Capture une note pour démarrer.</p>
</div>
```

## Signature produit (`DESIGN.md` §9)

- Segment de transcription actif en `transcript-focus` (22px/700, `text-primary`),
  synchronisé avec la waveform — barres actives `primary`, inactives `azure`.
- Avatars toujours circulaires. Boutons play : cercle 64px + `shadow-card`.

## Anti-patterns

| ❌ | ✅ |
|---|---|
| `style={{ color: … }}` | classe Tailwind / token |
| `border border-gray-300` | `shadow-card` (pas de bordure forte) |
| `bg-slate-900` / `bg-gray-*` | `bg-surface` / `bg-primary` |
| `text-muted` / `bg-neutral` (n'existent pas) | `text-on-surface-variant` / `bg-surface-container-low` |
| `rounded-lg` | `rounded-card` (32px) ou `rounded-pill` |
| `text-white` sur fond clair | `text-on-surface` |

## Navigation (`DashboardNav`)

- 5 onglets max : **Accueil · Capturer · Tâches · Passation · Équipe**.
- Actif = `text-primary` + barre inférieure 2px. Inactif = `text-on-surface-variant`.
- Icône 24px, label 12px (`label-md`). Fond `bg-surface-container`, fixe en bas.
