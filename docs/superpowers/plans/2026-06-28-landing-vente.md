# Landing de vente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la page d'accueil `/` (porte d'auth minimale) par une landing de vente complète : hero + mockup écran Tâches, « comment ça marche », piliers, réassurance RGPD, CTA final.

**Architecture:** Sections découpées en petits composants serveur statiques sous `src/components/landing/`, assemblées par `src/app/page.tsx`. Aucun état, aucune interactivité JS (hors ancre de scroll CSS). Le footer existant est réutilisé. Tout le copy est figé dans le spec.

**Tech Stack:** Next.js 16 (App Router, React Server Components), Tailwind v4 (tokens `globals.css`), Playwright (e2e). Spec source : `docs/specs/2026-06-28-landing-vente-design.md`.

## Global Constraints

- **Mobile-first strict** : rien ne dépasse à 393px (`overflow-x:hidden` déjà global). Hero empilé sur mobile, 2 colonnes en `md:`.
- **Tokens only** : couleurs/rayons/ombres via les tokens `globals.css` (cobalt `primary`, `cyan`, `secondary`, `surface`, `inverse-surface`…). Aucune valeur hex en dur.
- **Dark mode** : tout bascule via `html[data-theme="dark"]` (tokens). Pas de couleur non-thémable sur les bandes.
- **Tap ≥ 44px** : boutons `min-h-11` (44px) ou `min-h-14` (56px pour actions principales).
- **Copy vouvoiement, voix active**, textes exacts du spec, non modifiés.
- **Lint `react/no-unescaped-entities`** : dans le JSX littéral, échapper les apostrophes (`l&apos;IA`). Les textes placés dans des constantes JS gardent l'apostrophe normale.
- **Aucune table, aucune migration, aucune écriture base.** RLS inchangée.
- **Tests** : routes publiques → pas de backend Supabase requis (pas de tag `@backend`).

---

### Task 1 : Squelette de page + en-tête de navigation

**Files:**
- Create: `src/components/landing/LandingHeader.tsx`
- Modify: `src/app/page.tsx` (remplace tout le contenu actuel)
- Test: `tests/e2e/landing.spec.ts` (create)

**Interfaces:**
- Consumes: `Logo` de `@/components/Logo` (`<Logo size={number} />`), `Footer` de `@/components/Footer`.
- Produces: `LandingHeader` (export nommé, sans props).

- [ ] **Step 1: Écrire le test qui échoue**

Create `tests/e2e/landing.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

// Landing publique (page d'accueil). Routes publiques → pas de backend requis.
test.describe("Landing", () => {
  test("la nav propose connexion et création d'équipe", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(
      header.getByRole("link", { name: "Se connecter" }),
    ).toHaveAttribute("href", "/login");
    await expect(
      header.getByRole("link", { name: "Créer mon équipe" }),
    ).toHaveAttribute("href", "/signup");
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "la nav propose" --project=mobile-chrome`
Expected: FAIL — la page actuelle n'a pas de `<header>` (locator vide).

- [ ] **Step 3: Créer le composant `LandingHeader`**

Create `src/components/landing/LandingHeader.tsx` :

```tsx
import Link from "next/link";
import { Logo } from "@/components/Logo";

// En-tête de la landing : marque à gauche, connexion + CTA à droite.
export function LandingHeader() {
  return (
    <header className="w-full border-b border-outline-variant">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4"
      >
        <Link href="/" aria-label="Accueil Scribe IA">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary shadow-card transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            Créer mon équipe
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Réécrire `page.tsx` en squelette (header + main vide + footer)**

Replace the entire content of `src/app/page.tsx` :

```tsx
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">{/* sections ajoutées aux tâches suivantes */}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5: Lancer le test, vérifier qu'il passe**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "la nav propose" --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/LandingHeader.tsx src/app/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat(landing): squelette de page + en-tête de navigation"
```

---

### Task 2 : Hero + mockup écran Tâches

**Files:**
- Create: `src/components/landing/AppMockup.tsx`
- Create: `src/components/landing/Hero.tsx`
- Modify: `src/app/page.tsx` (monte `<Hero/>`)
- Test: `tests/e2e/landing.spec.ts` (ajoute un test)

**Interfaces:**
- Consumes: `StatusBadge` de `@/components/ui/StatusBadge` (`<StatusBadge status="proposed"|"validated"|"done"|"rejected" />`, libellé auto).
- Produces: `AppMockup` (sans props), `Hero` (sans props, importe `AppMockup`).

- [ ] **Step 1: Écrire le test qui échoue**

Append to the `test.describe("Landing", ...)` block in `tests/e2e/landing.spec.ts` :

```ts
  test("le hero affiche la promesse, les CTA et le mockup", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Rien ne se perd entre les équipes/,
      }),
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("link", { name: "Créer mon équipe" }).first(),
    ).toHaveAttribute("href", "/signup");
    await expect(
      page.getByRole("link", { name: "Voir comment ça marche" }),
    ).toHaveAttribute("href", "#comment-ca-marche");
    await expect(page.getByText("Tâches du poste")).toBeVisible();
  });
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "le hero affiche" --project=mobile-chrome`
Expected: FAIL — pas de `<h1>` « Rien ne se perd », pas de mockup.

- [ ] **Step 3: Créer le mockup d'écran Tâches**

Create `src/components/landing/AppMockup.tsx` :

```tsx
import { StatusBadge, type TaskStatus } from "@/components/ui/StatusBadge";

// Faux écran « Tâches » reconstruit en markup (illustration, jamais une donnée
// réelle) — bascule clair/sombre via les tokens. Décoratif → aria-hidden.
const TASKS: { label: string; status: TaskStatus; dot: string }[] = [
  { label: "Recontrôler la palette quai 3", status: "validated", dot: "bg-cyan" },
  { label: "Commander films étirables", status: "proposed", dot: "bg-status-proposed" },
  { label: "Relève chariot élévateur n°2", status: "done", dot: "bg-status-done" },
];

export function AppMockup() {
  return (
    <div
      aria-hidden
      className="rounded-card border border-outline-variant bg-card p-4 shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-secondary">Tâches du poste</span>
        <span className="tnum text-xs font-semibold text-on-surface-variant">
          Lu par 6 / 8
        </span>
      </div>
      <ul className="space-y-2">
        {TASKS.map((t) => (
          <li
            key={t.label}
            className="flex items-center gap-3 rounded-lg border border-line-soft p-3"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} />
            <span className="flex-1 text-sm text-on-surface">{t.label}</span>
            <StatusBadge status={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Créer le hero**

Create `src/components/landing/Hero.tsx` :

```tsx
import Link from "next/link";
import { AppMockup } from "./AppMockup";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-pill border border-outline-variant bg-card px-3 py-1 text-xs font-semibold text-on-surface-variant">
            Pour les équipes qui se relaient · 3×8, 2×8, postes
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-secondary md:text-5xl">
            Rien ne se perd entre les équipes.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-on-surface-variant">
            Vos équipes se relaient, l&apos;information non. Dictez vos notes de
            fin de poste&nbsp;: l&apos;IA en sort les tâches, votre équipe valide,
            et la relève reçoit tout.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-14 items-center justify-center rounded-pill bg-primary px-7 text-base font-semibold text-on-primary shadow-card transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              Créer mon équipe
            </Link>
            <Link
              href="#comment-ca-marche"
              className="inline-flex min-h-14 items-center justify-center rounded-pill bg-transparent px-7 text-base font-semibold text-primary ring-1 ring-inset ring-outline-variant transition-all hover:bg-azure active:scale-[0.98]"
            >
              Voir comment ça marche
            </Link>
          </div>
        </div>
        <div>
          <AppMockup />
          <p className="mt-3 text-center text-xs italic text-on-surface-variant">
            L&apos;écran Tâches&nbsp;: l&apos;IA a proposé, votre équipe valide
            d&apos;un geste.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Monter le hero dans `page.tsx`**

In `src/app/page.tsx`, add the import and replace the empty `<main>`:

```tsx
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 6: Lancer le test, vérifier qu'il passe**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "le hero affiche" --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/AppMockup.tsx src/components/landing/Hero.tsx src/app/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat(landing): hero + mockup écran Tâches"
```

---

### Task 3 : Section « Comment ça marche » (3 étapes) + scroll doux

**Files:**
- Create: `src/components/landing/HowItWorks.tsx`
- Modify: `src/app/globals.css` (scroll-behavior sous prefers-reduced-motion)
- Modify: `src/app/page.tsx` (monte `<HowItWorks/>`)
- Test: `tests/e2e/landing.spec.ts` (ajoute un test)

**Interfaces:**
- Produces: `HowItWorks` (sans props ; rend `<section id="comment-ca-marche">`).

- [ ] **Step 1: Écrire le test qui échoue**

Append to the describe block in `tests/e2e/landing.spec.ts` :

```ts
  test("la section comment ça marche détaille les 3 étapes", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#comment-ca-marche");
    await expect(section).toBeVisible();
    await expect(section.getByText("Dictez en fin de poste")).toBeVisible();
    await expect(section.getByText("L'IA propose, vous validez")).toBeVisible();
    await expect(section.getByText("La relève reçoit tout")).toBeVisible();
  });
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "comment ça marche" --project=mobile-chrome`
Expected: FAIL — pas de `#comment-ca-marche`.

- [ ] **Step 3: Créer la section**

Create `src/components/landing/HowItWorks.tsx` :

```tsx
// Le parcours en 3 temps (récit de la passation). Cible de l'ancre du hero.
const STEPS = [
  {
    n: 1,
    title: "Dictez en fin de poste",
    desc: "Vous parlez, Scribe écoute. Pas de saisie après huit heures debout.",
  },
  {
    n: 2,
    title: "L'IA propose, vous validez",
    desc: "Scribe sort les tâches de votre note. Vous validez avant que rien ne parte : rien ne se déclenche sans un humain.",
  },
  {
    n: 3,
    title: "La relève reçoit tout",
    desc: "L'équipe suivante ouvre une passation claire. Vous voyez qui a lu, et quoi.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="mx-auto w-full max-w-5xl scroll-mt-8 px-6 py-12 md:py-16"
    >
      <p className="eyebrow">Comment ça marche</p>
      <ol className="mt-6 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4 md:flex-col">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-extrabold text-on-primary">
              {s.n}
            </span>
            <div>
              <h2 className="text-lg font-bold text-secondary">{s.title}</h2>
              <p className="mt-1 leading-relaxed text-on-surface-variant">
                {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 4: Activer le scroll doux (respecte prefers-reduced-motion)**

In `src/app/globals.css`, find the block:

```css
@media (prefers-reduced-motion: no-preference) {
  body {
    transition: background-color 200ms ease, color 200ms ease;
  }
}
```

Replace it with:

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
  body {
    transition: background-color 200ms ease, color 200ms ease;
  }
}
```

- [ ] **Step 5: Monter la section dans `page.tsx`**

In `src/app/page.tsx`, add `import { HowItWorks } from "@/components/landing/HowItWorks";` and add `<HowItWorks />` right after `<Hero />` inside `<main>`.

- [ ] **Step 6: Lancer le test, vérifier qu'il passe**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "comment ça marche" --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/HowItWorks.tsx src/app/globals.css src/app/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat(landing): section comment ça marche + scroll doux d'ancre"
```

---

### Task 4 : Piliers « Pourquoi Scribe » + bandeau réassurance RGPD

**Files:**
- Create: `src/components/landing/Pillars.tsx`
- Create: `src/components/landing/TrustBar.tsx`
- Modify: `src/app/page.tsx` (monte les deux)
- Test: `tests/e2e/landing.spec.ts` (ajoute un test)

**Interfaces:**
- Produces: `Pillars` (sans props), `TrustBar` (sans props, liens vers `/confidentialite` et `/conformite`).

- [ ] **Step 1: Écrire le test qui échoue**

Append to the describe block in `tests/e2e/landing.spec.ts` :

```ts
  test("les piliers et la réassurance RGPD sont présents", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Vous gardez la main")).toBeVisible();
    await expect(page.getByText("La mémoire de l'équipe")).toBeVisible();
    await expect(page.getByText("Zéro friction")).toBeVisible();
    await expect(
      page.getByText(/Vos données restent en Europe/),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Confidentialité" }).first(),
    ).toHaveAttribute("href", "/confidentialite");
  });
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "piliers et la réassurance" --project=mobile-chrome`
Expected: FAIL — sections absentes.

- [ ] **Step 3: Créer les piliers**

Create `src/components/landing/Pillars.tsx` :

```tsx
// Pourquoi Scribe : 3 différenciateurs (bénéfices, pas étapes). Bande distincte.
const PILLARS = [
  {
    icon: "✅",
    title: "Vous gardez la main",
    desc: "L'IA propose, vous décidez. Aucune relance ne part sans votre validation.",
  },
  {
    icon: "🧠",
    title: "La mémoire de l'équipe",
    desc: "Tâches, accusés de lecture, rapport de passation : ce que vous dictez à 22h est là à 6h.",
  },
  {
    icon: "🎙️",
    title: "Zéro friction",
    desc: "On dicte sur son téléphone en trente secondes. Pas de formation, pas de logiciel lourd.",
  },
];

export function Pillars() {
  return (
    <section className="bg-surface-dim">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
        <p className="eyebrow">Pourquoi Scribe</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-lg border border-outline-variant bg-card p-5 shadow-card"
            >
              <span className="text-2xl" aria-hidden>
                {p.icon}
              </span>
              <h2 className="mt-3 text-base font-bold text-secondary">
                {p.title}
              </h2>
              <p className="mt-1 leading-relaxed text-on-surface-variant">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Créer le bandeau de réassurance**

Create `src/components/landing/TrustBar.tsx` :

```tsx
import Link from "next/link";

// Réassurance RGPD/UE. Fond status-validated-bg (bascule clair/sombre) + texte
// cyan-text (AA dans les deux thèmes). Preuve de confiance, liens légaux réels.
export function TrustBar() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-lg border border-outline-variant bg-status-validated-bg px-5 py-4 text-center text-sm leading-relaxed text-cyan-text">
        <span aria-hidden>🇪🇺 </span>
        <strong className="font-bold">Vos données restent en Europe.</strong>{" "}
        Elles ne servent jamais à entraîner l&apos;IA.{" "}
        <Link
          href="/confidentialite"
          className="font-bold underline underline-offset-4"
        >
          Confidentialité
        </Link>
        {" · "}
        <Link
          href="/conformite"
          className="font-bold underline underline-offset-4"
        >
          Conformité
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Monter les deux sections dans `page.tsx`**

In `src/app/page.tsx`, add imports for `Pillars` and `TrustBar`, then add `<Pillars />` and `<TrustBar />` after `<HowItWorks />` inside `<main>` (dans cet ordre).

- [ ] **Step 6: Lancer le test, vérifier qu'il passe**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "piliers et la réassurance" --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/Pillars.tsx src/components/landing/TrustBar.tsx src/app/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat(landing): piliers Pourquoi Scribe + bandeau réassurance RGPD"
```

---

### Task 5 : CTA final + métadonnées + garde anti-débordement + vérif finale

**Files:**
- Create: `src/components/landing/FinalCta.tsx`
- Modify: `src/app/page.tsx` (monte `<FinalCta/>` + `metadata`)
- Test: `tests/e2e/landing.spec.ts` (ajoute 3 tests)

**Interfaces:**
- Produces: `FinalCta` (sans props). `page.tsx` exporte `metadata` (`title`/`description`).

- [ ] **Step 1: Écrire les tests qui échouent**

Append to the describe block in `tests/e2e/landing.spec.ts` :

```ts
  test("le CTA final invite à créer l'équipe", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Essayez sur votre prochaine relève." }),
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("link", { name: "Créer mon équipe" }).last(),
    ).toHaveAttribute("href", "/signup");
  });

  test("le titre de la page mentionne la promesse", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Rien ne se perd/);
  });

  test("aucun débordement horizontal sur mobile (393px)", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
```

- [ ] **Step 2: Lancer les tests, vérifier qu'ils échouent**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "CTA final|titre de la page|débordement" --project=mobile-chrome`
Expected: FAIL — CTA final absent + titre encore « Scribe — coordination d'équipe ».

- [ ] **Step 3: Créer le CTA final**

Create `src/components/landing/FinalCta.tsx` :

```tsx
import Link from "next/link";

// Bande inversée (toujours contrastée clair ET sombre via inverse-surface).
// Bouton clair sur la bande (pas de cobalt plein sur marine — cf. spec §2.5).
export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-16">
      <div className="rounded-card bg-inverse-surface px-6 py-12 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-inverse-on-surface md:text-3xl">
          Essayez sur votre prochaine relève.
        </h2>
        <p className="mt-2 text-inverse-on-surface/80">
          Créez votre équipe en deux minutes.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-pill bg-card px-7 text-base font-semibold text-primary shadow-card transition-all hover:brightness-95 active:scale-[0.98]"
        >
          Créer mon équipe
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Monter le CTA + ajouter les métadonnées de page**

Replace the entire content of `src/app/page.tsx` :

```tsx
import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pillars } from "@/components/landing/Pillars";
import { TrustBar } from "@/components/landing/TrustBar";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/Footer";

// Surcharge le <title>/description pour l'accueil. L'openGraph/twitter restent
// hérités de layout.tsx (le test og-meta reste vert).
export const metadata: Metadata = {
  title: "Scribe — Rien ne se perd entre les équipes",
  description:
    "Dictez vos notes de fin de poste : l'IA en sort les tâches, votre équipe valide, et la relève reçoit tout. Coordination pour les équipes en relais 3×8. Données en Europe.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Pillars />
        <TrustBar />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5: Lancer les tests, vérifier qu'ils passent**

Run: `npx playwright test tests/e2e/landing.spec.ts -g "CTA final|titre de la page|débordement" --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 6: Suite e2e complète (mobile + desktop) + lint + build**

Run: `npx playwright test tests/e2e/landing.spec.ts`
Expected: tous verts (mobile-chrome + desktop-chrome).

Run: `npm run lint`
Expected: 0 erreur (vérifier `react/no-unescaped-entities`).

Run: `npm run build`
Expected: build vert, route `/` présente.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/FinalCta.tsx src/app/page.tsx tests/e2e/landing.spec.ts
git commit -m "feat(landing): CTA final + métadonnées d'accueil + garde anti-overflow"
```

---

## Vérification finale (après Task 5)

- [ ] Lancer l'app (`npm run dev`) et inspecter `/` en **clair** et en **sombre** (toggle thème). Vérifier : titre lisible, mockup net, bande RGPD lisible dans les deux thèmes, CTA final contrasté, rien qui dépasse à 393px.
- [ ] Confirmer qu'aucune table/migration n'a été touchée (`git diff --stat main` ne montre que `src/app/page.tsx`, `src/components/landing/*`, `src/app/globals.css`, `tests/e2e/landing.spec.ts`).

## Self-review (couverture du spec)

| Exigence spec | Tâche |
|---|---|
| Header nav (logo + connexion + CTA) | Task 1 |
| Hero (tag, h1 visible, sous-titre, 2 CTA, légende) | Task 2 |
| Mockup écran Tâches reconstruit (StatusBadge réutilisé) | Task 2 |
| Comment ça marche (3 étapes, ancre `#comment-ca-marche`) | Task 3 |
| Scroll doux respectant reduced-motion | Task 3 |
| 3 piliers « Pourquoi Scribe » | Task 4 |
| Bandeau RGPD + liens `/confidentialite` `/conformite` | Task 4 |
| CTA final (contraste sur bande inversée, pas cobalt plein) | Task 5 |
| Footer existant réutilisé | Task 1 |
| Métadonnées title/description accueil | Task 5 |
| Mobile-first, aucun overflow 393px | Task 5 (test) |
| Tokens only / dark mode | Toutes (vérif finale) |
| Aucune table/migration | Toutes (vérif finale) |
