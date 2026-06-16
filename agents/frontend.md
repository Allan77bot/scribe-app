# Frontend — Scribe IA

> Spécifications UI/UX pour les agents de build et design. Lu automatiquement
> par l'agent Explore de Claude Code (exploration codebase) et l'agent Build
> (implémentation UI).

## Stack

- **Next.js 16** App Router, React 19, TypeScript strict
- **Tailwind v4** (CSS-first, `@theme` dans `globals.css` — PAS de `tailwind.config.ts`)
- **Manrope** chargée via `next/font/google`, graisses 400/500/600/700/800

## Design System (source: `DESIGN.md` §2.2)

| Rôle | Token CSS | Usage |
|------|-----------|-------|
| Fond app | `bg-surface` → `#f7fafd` | Toute page |
| Cartes | `bg-white rounded-card p-6 shadow-card` | Conteneurs |
| Titres | `text-secondary` → `#002b5b` | Hn, labels |
| Corps | `text-on-surface` → `#181c1e` | Paragraphes |
| Bouton primary | `bg-primary rounded-pill h-14 text-white` | CTA |
| Bouton secondary | `bg-azure text-primary` | Actions secondaires |
| Input | `bg-neutral rounded-field` sans bordure | Formulaires |
| Erreur | `text-error bg-error-container` | Messages d'erreur |
| Icône active | `text-primary size-6` | Navigation, statuts |
| Ombres | `shadow-card` `rgba(0,43,91,0.05)` | Profondeur |

## Patterns obligatoires

- **Mobile-first strict** — `overflow-x:hidden`, rien qui dépasse à 360px
- **Server Components** par défaut ; `"use client"` uniquement si interactif
- **Jamais de `style={{}}`** — tout en classes Tailwind / tokens CSS
- **Jamais de bordures fortes** — séparateurs `border-azure/5`
- **Pas de thème dark** — ce projet est 100% clair (Professional Flow)

## Composants canoniques

Copier-coller ces patterns :

```tsx
// Carte standard
<div className="rounded-card bg-white p-6 shadow-card">…</div>

// Bouton primary
<button className="rounded-pill bg-primary h-14 px-6 font-semibold text-white">…</button>

// Bouton secondary
<button className="rounded-pill bg-azure px-6 font-medium text-primary">…</button>

// Input
<input className="rounded-field bg-neutral w-full px-4 py-3 text-base" />

// Empty state
<div className="flex flex-col items-center gap-4 py-12 text-center">
  <Icon className="size-6 text-primary" />
  <p className="text-secondary font-semibold">Aucune donnée</p>
  <p className="text-on-surface-variant text-sm">Message d'action…</p>
</div>
```

## Anti-patterns

- ❌ `style={{}}` inline → ✅ classe Tailwind
- ❌ `border` fort contraste → ✅ `shadow-card`
- ❌ Slate/gray générique → ✅ tokens `surface`/`secondary`/`muted`
- ❌ `bg-slate-900` / `bg-gray-*` → ✅ `bg-surface` / `bg-primary`
- ❌ `rounded-lg` → ✅ `rounded-card` (32px) ou `rounded-pill`
- ❌ Texte `text-white` sur fond clair → ✅ `text-on-surface`

## Navigation (DashboardNav)

- 5 onglets max : Accueil · Capturer · Tâches · Passation · Équipe
- Actif = `text-primary` + barre inférieure 2px
- Inactif = `text-muted`
- Icône 24px, label 12px
- Fond `surface-container`
