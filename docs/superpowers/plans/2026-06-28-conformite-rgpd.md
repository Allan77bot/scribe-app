# Socle conformité RGPD (contenu) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer le socle de conformité RGPD de Scribe IA en CONTENU SEUL : 4 pages légales publiques + un DPA imprimable + une notice salariés, un footer, et une case d'acceptation des CGU à l'inscription.

**Architecture:** Route group Next.js `(legal)` avec un layout partagé (chrome + footer) ; chaque page est un composant serveur React qui rend du contenu via un wrapper typographique `Prose`. Zéro nouvelle dépendance, zéro table, zéro migration. Les routes sont publiques (le middleware ne garde que `/dashboard`).

**Tech Stack:** Next.js 16 (App Router, route groups, server components), Tailwind v4 (tokens `@theme` de `globals.css`), Playwright (`@playwright/test`) pour les tests e2e.

## Global Constraints

- **Mobile-first strict** : `overflow-x` maîtrisé, rien qui dépasse (vérifié à 393px). `globals.css` impose déjà `html,body { overflow-x:hidden }`.
- **Vouvoiement** partout, voix active (décision projet — copy au « vous »).
- **Code/noms en anglais, copy/commentaires en français.**
- **Aucune table à `org_id`** créée → `check:rls` non concerné, posture RLS inchangée.
- **Design tokens existants uniquement** (pas de classe devinée) : surfaces `bg-surface`/`bg-card`, texte `text-on-surface`/`text-on-surface-variant`/`text-secondary`/`text-primary`/`text-outline`, bordures `border-outline-variant`, accents `text-cyan-text`/`bg-cyan-tint`, rayons `rounded-card`/`rounded-field`/`rounded-lg`, ombres `shadow-card`. Dark mode automatique (tokens basculent via `html[data-theme="dark"]`).
- **Identité légale (verbatim)** : Service « Scribe IA » · Éditeur « Allan Morjon » (micro-entreprise / entreprise individuelle) · SIREN « 878 736 784 » · Siège « 12 rue de la Pierre Lorraine, 77440 Congis-sur-Thérouanne » · Contact « contact@scribeia.fr » · « TVA non applicable, art. 293 B du CGI » · Directeur de la publication « Allan Morjon » · Hébergeurs : Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA, region UE) + Supabase (données UE, Francfort).
- **Avertissement juridique** : tout passage à portée contractuelle sensible est balisé par un commentaire `{/* [À VALIDER PAR JURISTE] */}` dans le code.
- **Sous-traitants (6)** : Supabase (BDD/stockage, UE Francfort), Vercel (hébergement app, UE), OpenAI Ireland Ltd (transcription, UE, rétention 30j, pas d'entraînement API), Anthropic Ireland Ltd (extraction+synthèse, UE, SCCs, pas d'entraînement API), Brevo (e-mails, France), Stripe Payments Europe (paiement, UE/Irlande).
- **Tests e2e publics** : pas de tag `@backend` (aucun besoin de Supabase). Lancer : `npx playwright test tests/e2e/<spec>`. Le `webServer` Playwright démarre `npm run dev` automatiquement.

---

## File Structure

| Fichier | Rôle |
|---|---|
| `src/components/Footer.tsx` (create) | Footer : 4 liens légaux + © Scribe IA. Réutilisé landing + legal. |
| `src/components/legal/LastUpdated.tsx` (create) | Badge « Dernière mise à jour : <date> · v<version> ». |
| `src/components/legal/Prose.tsx` (create) | Wrapper typographique (style des h2/h3/p/ul/a). |
| `src/app/(legal)/layout.tsx` (create) | Chrome légal : header logo→accueil, conteneur lisible, Footer. |
| `src/app/(legal)/mentions-legales/page.tsx` (create) | Mentions légales (§ identité). |
| `src/app/(legal)/confidentialite/page.tsx` (create) | Politique de confidentialité (2 casquettes). |
| `src/app/(legal)/cgu/page.tsx` (create) | CGU + mention IA. |
| `src/app/(legal)/conformite/page.tsx` (create) | Hub Conformité + notice salariés copiable. |
| `src/app/(legal)/conformite/dpa/page.tsx` (create) | DPA art. 28, imprimable. |
| `src/app/page.tsx` (modify) | Ajout du `<Footer />`. |
| `src/lib/auth/terms.ts` (create) | `isTermsAccepted()` — vérif pure, testable. |
| `src/app/(auth)/signup/page.tsx` (modify) | Case CGU requise. |
| `src/lib/auth/actions.ts` (modify, ~ligne 31) | Vérif serveur d'acceptation des CGU. |
| `tests/e2e/legal-pages.spec.ts` (create) | Pages publiques + footer + mobile. |
| `tests/e2e/signup-terms.spec.ts` (create) | `isTermsAccepted` (unit) + case requise (e2e). |

---

## Task 1 : Infra légale + Footer + Mentions légales

**Files:**
- Create: `src/components/Footer.tsx`, `src/components/legal/LastUpdated.tsx`, `src/components/legal/Prose.tsx`, `src/app/(legal)/layout.tsx`, `src/app/(legal)/mentions-legales/page.tsx`
- Modify: `src/app/page.tsx` (ajout Footer)
- Test: `tests/e2e/legal-pages.spec.ts`

**Interfaces:**
- Produces:
  - `Footer()` → JSX (`import { Footer } from "@/components/Footer"`)
  - `LastUpdated({ date, version }: { date: string; version: string })` → JSX
  - `Prose({ children }: { children: React.ReactNode })` → JSX
  - `LegalLayout` = export default de `(legal)/layout.tsx`
- Consumes : `Logo` (`@/components/Logo`, props `size?: number; className?: string`).

- [ ] **Step 1 : Écrire le test e2e (échoue d'abord)**

Create `tests/e2e/legal-pages.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

// Pages légales publiques — accessibles sans session, footer présent, mobile-first.
const PUBLIC_LEGAL = [
  { path: "/mentions-legales", marker: "Mentions légales" },
];

test.describe("Pages légales publiques", () => {
  for (const { path, marker } of PUBLIC_LEGAL) {
    test(`${path} est public et affiche son titre`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { name: marker })).toBeVisible();
    });

    test(`${path} montre le footer avec les 4 liens légaux`, async ({ page }) => {
      await page.goto(path);
      const footer = page.getByRole("contentinfo");
      await expect(footer.getByRole("link", { name: "Conformité" })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Mentions légales" })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Confidentialité" })).toBeVisible();
      await expect(footer.getByRole("link", { name: "CGU" })).toBeVisible();
    });

    test(`${path} ne déborde pas horizontalement`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }
});

test("la landing montre le footer légal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Mentions légales" })).toBeVisible();
});
```

- [ ] **Step 2 : Lancer le test → échoue**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: FAIL (`/mentions-legales` renvoie 404, pas de footer).

- [ ] **Step 3 : Créer `src/components/Footer.tsx`**

```tsx
import Link from "next/link";

// Liens légaux — présents sur la landing et toutes les pages (legal).
const LEGAL_LINKS = [
  { href: "/conformite", label: "Conformité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant px-6 py-8 text-center">
      <nav
        aria-label="Liens légaux"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
      >
        {LEGAL_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-on-surface-variant underline-offset-4 hover:text-primary hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-xs text-outline">© {new Date().getFullYear()} Scribe IA</p>
    </footer>
  );
}
```

- [ ] **Step 4 : Créer `src/components/legal/LastUpdated.tsx`**

```tsx
// Badge « dernière mise à jour » + version, en tête de chaque document légal.
export function LastUpdated({ date, version }: { date: string; version: string }) {
  return (
    <p className="eyebrow mb-8">
      Dernière mise à jour : {date} · v{version}
    </p>
  );
}
```

- [ ] **Step 5 : Créer `src/components/legal/Prose.tsx`**

```tsx
import type { ReactNode } from "react";

// Conteneur typographique des documents légaux. Le projet n'a pas le plugin
// @tailwindcss/typography → on style les éléments enfants via variantes descendantes
// Tailwind v4. Les couleurs de titres (h2/h3) viennent de globals.css (secondary).
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="text-[15px] leading-relaxed text-on-surface [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-secondary">
      {children}
    </div>
  );
}
```

- [ ] **Step 6 : Créer `src/app/(legal)/layout.tsx`**

```tsx
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

// Chrome commun des pages légales : en-tête (logo → accueil), conteneur lisible, footer.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-outline-variant px-6 py-4">
        <Link href="/" aria-label="Retour à l'accueil" className="inline-flex">
          <Logo size={32} />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 7 : Créer `src/app/(legal)/mentions-legales/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Mentions légales — Scribe IA",
  description: "Mentions légales du service Scribe IA.",
};

export default function MentionsLegalesPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Mentions légales</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <h2>Éditeur du service</h2>
      <p>
        Le service <strong>Scribe IA</strong> est édité par <strong>Allan Morjon</strong>,
        entrepreneur individuel (micro-entreprise).
      </p>
      <ul>
        <li>SIREN : <strong>878 736 784</strong></li>
        <li>Siège : 12 rue de la Pierre Lorraine, 77440 Congis-sur-Thérouanne, France</li>
        <li>Contact : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a></li>
        <li>TVA non applicable, article 293 B du Code général des impôts</li>
        <li>Directeur de la publication : Allan Morjon</li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        L&apos;application est hébergée par <strong>Vercel Inc.</strong> (440 N Barranca Ave
        #4133, Covina, CA 91723, États-Unis — région d&apos;exécution Union européenne).
        Les données (base de données, fichiers, authentification) sont hébergées par
        <strong> Supabase</strong> dans l&apos;Union européenne (Francfort, Allemagne).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du service (marque, logo, interface, textes) est protégé.
        Toute reproduction sans autorisation est interdite.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.
      </p>
    </Prose>
  );
}
```

- [ ] **Step 8 : Ajouter le Footer à la landing — modifier `src/app/page.tsx`**

Remplacer le `<main>` racine pour wrapper + footer. Le fichier actuel rend un `<main>` centré ; on l'enveloppe :

```tsx
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Carte blanche flottante (élévation niveau 1). */}
        <div className="w-full max-w-md rounded-card bg-card p-6 shadow-card">
          <h1 className="sr-only">Scribe IA</h1>
          <Logo size={48} className="mb-6 justify-center" />
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            Transformez vos notes vocales en coordination d&apos;équipe&nbsp;: tâches suivies,
            accusés de lecture, rapport de passation automatique.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/signup"
              className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              Créer mon équipe
            </Link>
            <Link
              href="/login"
              className="flex h-14 w-full items-center justify-center rounded-pill bg-azure px-6 text-base font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 9 : Lancer le test → passe**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: PASS (4 tests verts).

- [ ] **Step 10 : Build + commit**

Run: `npm run build` (attendu : vert, route `/mentions-legales` listée) puis `npm run lint`.

```bash
git add src/components/Footer.tsx src/components/legal/ "src/app/(legal)/layout.tsx" "src/app/(legal)/mentions-legales/page.tsx" src/app/page.tsx tests/e2e/legal-pages.spec.ts
git commit -m "feat(legal): chrome legal + footer + mentions légales"
```

---

## Task 2 : Politique de confidentialité

**Files:**
- Create: `src/app/(legal)/confidentialite/page.tsx`
- Modify: `tests/e2e/legal-pages.spec.ts` (ajouter l'entrée)

**Interfaces:**
- Consumes : `Prose`, `LastUpdated` (Task 1).

- [ ] **Step 1 : Étendre le test — ajouter l'entrée dans `PUBLIC_LEGAL`**

Dans `tests/e2e/legal-pages.spec.ts`, ajouter à `PUBLIC_LEGAL` :

```ts
  { path: "/confidentialite", marker: "Politique de confidentialité" },
```

- [ ] **Step 2 : Lancer → échoue**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: FAIL sur `/confidentialite` (404).

- [ ] **Step 3 : Créer `src/app/(legal)/confidentialite/page.tsx`**

Contenu couvrant TOUS les éléments requis (les 2 casquettes du §3 de la spec). Prose française, vouvoiement, `[À VALIDER PAR JURISTE]` sur les durées et bases légales.

```tsx
import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Scribe IA",
  description: "Comment Scribe IA traite les données personnelles (RGPD).",
};

export default function ConfidentialitePage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Politique de confidentialité</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <p>
        La présente politique décrit comment <strong>Scribe IA</strong> (Allan Morjon,
        micro-entreprise) traite les données personnelles, conformément au RGPD.
      </p>

      <h2>1. Deux rôles distincts</h2>
      <p>
        <strong>Données des membres de votre équipe.</strong> Lorsque vous utilisez Scribe IA,
        votre organisation est <strong>responsable de traitement</strong> et Scribe IA agit comme
        <strong> sous-traitant</strong>, pour votre compte et sur vos instructions. Ce cadre est
        défini par notre <a href="/conformite/dpa">accord de sous-traitance (DPA)</a>.
      </p>
      <p>
        <strong>Données des visiteurs et prospects.</strong> Pour les personnes qui nous
        contactent ou visitent notre site, <strong>Scribe IA est responsable de traitement</strong>.
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>Compte : nom, adresse e-mail, mot de passe (chiffré), organisation, rôle.</li>
        <li>Contenu : notes vocales et écrites, tâches, accusés de lecture, rapports.</li>
        <li>Techniques : journaux de connexion, données d&apos;usage strictement nécessaires.</li>
        <li>Prospects : adresse e-mail et message lorsque vous nous écrivez.</li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>Fournir le service (comptes, capture, coordination) — <strong>exécution du contrat</strong>.</li>
        <li>Traitement du contenu par l&apos;IA (transcription, extraction) — pour le compte du responsable de traitement. {/* [À VALIDER PAR JURISTE] */}</li>
        <li>Facturation — <strong>obligation légale</strong>.</li>
        <li>Sécurité et prévention des abus — <strong>intérêt légitime</strong>.</li>
        <li>Réponse aux prospects — <strong>intérêt légitime</strong> (prospection B2B).</li>
      </ul>

      <h2>4. Sous-traitants</h2>
      <p>Nous faisons appel aux sous-traitants suivants, tous situés dans l&apos;Union européenne :</p>
      <ul>
        <li><strong>Supabase</strong> — base de données, stockage, authentification (UE, Francfort).</li>
        <li><strong>Vercel</strong> — hébergement de l&apos;application (UE ; éditeur américain, encadré par des clauses contractuelles types).</li>
        <li><strong>OpenAI Ireland Ltd</strong> — transcription des notes vocales (UE ; rétention 30 jours, pas d&apos;entraînement sur les données de l&apos;API).</li>
        <li><strong>Anthropic Ireland Ltd</strong> — extraction et synthèse par IA (UE ; pas d&apos;entraînement sur les données de l&apos;API).</li>
        <li><strong>Brevo</strong> — e-mails transactionnels (France).</li>
        <li><strong>Stripe Payments Europe</strong> — paiement des abonnements (UE, Irlande).</li>
      </ul>

      <h2>5. Transferts hors UE</h2>
      <p>
        Les données sont hébergées dans l&apos;Union européenne. Lorsqu&apos;un sous-traitant a une
        maison-mère hors UE, le transfert est encadré par des <strong>clauses contractuelles types</strong>
        (CCT) de la Commission européenne. {/* [À VALIDER PAR JURISTE] */}
      </p>

      <h2>6. Durées de conservation</h2>
      <ul>
        <li>Compte et données d&apos;organisation : durée du contrat, puis suppression sous 30 jours. {/* [À VALIDER PAR JURISTE] */}</li>
        <li>Fichiers audio : le temps nécessaire à la fonctionnalité, supprimés avec l&apos;entrée ou l&apos;organisation. {/* [À VALIDER PAR JURISTE] */}</li>
        <li>Données de facturation : 10 ans (obligation comptable).</li>
        <li>Données de prospection : 3 ans après le dernier contact.</li>
        <li>Journaux techniques : 6 à 12 mois.</li>
      </ul>

      <h2>7. Sécurité</h2>
      <p>
        Cloisonnement strict par organisation (Row Level Security), accès aux fichiers par URL
        signées, chiffrement en transit. Aucune organisation n&apos;accède aux données d&apos;une autre.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Scribe IA utilise uniquement des cookies <strong>strictement nécessaires</strong> (session de
        connexion) et, le cas échéant, une <strong>mesure d&apos;audience anonyme</strong> exemptée de
        consentement. <strong>Aucun cookie publicitaire</strong>, aucun traceur tiers de suivi.
      </p>

      <h2>9. Vos droits</h2>
      <p>
        Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation,
        d&apos;opposition et de portabilité, ainsi que du droit d&apos;introduire une réclamation
        auprès de la <strong>CNIL</strong>. Pour les données d&apos;un salarié, ces droits s&apos;exercent
        auprès de l&apos;employeur (responsable de traitement) ; Scribe IA l&apos;assiste.
      </p>
      <p>Contact : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.</p>
    </Prose>
  );
}
```

- [ ] **Step 4 : Lancer → passe**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 5 : Build + commit**

Run: `npm run build` (route `/confidentialite` listée).

```bash
git add "src/app/(legal)/confidentialite/page.tsx" tests/e2e/legal-pages.spec.ts
git commit -m "feat(legal): politique de confidentialité (2 casquettes RGPD)"
```

---

## Task 3 : CGU + mention IA

**Files:**
- Create: `src/app/(legal)/cgu/page.tsx`
- Modify: `tests/e2e/legal-pages.spec.ts`

**Interfaces:**
- Consumes : `Prose`, `LastUpdated` (Task 1).

- [ ] **Step 1 : Étendre le test**

Ajouter à `PUBLIC_LEGAL` :

```ts
  { path: "/cgu", marker: "Conditions générales" },
```

Et ajouter un test dédié à la mention IA (sous le bloc `for`) — regex insensible à la casse et aux variantes d'apostrophe pour éviter toute fragilité :

```ts
test("les CGU mentionnent explicitement le fonctionnement de l'IA", async ({ page }) => {
  await page.goto("/cgu");
  await expect(page.getByText(/l['’]IA propose, l['’]humain valide/i)).toBeVisible();
});
```

- [ ] **Step 2 : Lancer → échoue**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: FAIL sur `/cgu`.

- [ ] **Step 3 : Créer `src/app/(legal)/cgu/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation — Scribe IA",
  description: "Conditions générales d’utilisation du service Scribe IA.",
};

export default function CguPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Conditions générales d’utilisation</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent l&apos;utilisation du service <strong>Scribe IA</strong>,
        qui transforme des notes vocales et écrites en coordination d&apos;équipe (tâches suivies,
        accusés de lecture, rapport de passation).
      </p>

      <h2>2. Compte et accès</h2>
      <p>
        L&apos;accès nécessite la création d&apos;un compte. Vous êtes responsable de la
        confidentialité de vos identifiants et des actions réalisées via votre compte.
      </p>

      <h2>3. Usage acceptable</h2>
      <p>
        Vous vous engagez à un usage professionnel, licite, sans porter atteinte aux droits des tiers
        ni détourner le service de sa finalité de coordination.
      </p>

      <h2>4. Fonctionnement de l’intelligence artificielle</h2>
      <p>
        Scribe IA recourt à l&apos;IA pour <strong>transcrire</strong> les notes vocales (OpenAI
        Ireland Ltd) et <strong>extraire et synthétiser</strong> les tâches (Anthropic Ireland Ltd).
      </p>
      <ul>
        <li><strong>L’IA propose, l’humain valide.</strong> Aucune tâche ne déclenche d&apos;effet (relance, escalade) sans validation humaine explicite : il n&apos;y a pas de décision entièrement automatisée produisant des effets juridiques (art. 22 RGPD).</li>
        <li>La transcription et l&apos;extraction peuvent comporter des erreurs ; il vous appartient de vérifier et de valider le contenu proposé.</li>
        <li>Vos contenus ne sont <strong>pas utilisés pour entraîner</strong> les modèles d&apos;IA (usage via API).</li>
      </ul>

      <h2>5. Abonnement et paiement</h2>
      <p>
        Certaines fonctionnalités sont payantes, par abonnement, réglé via <strong>Stripe</strong>.
        Les conditions tarifaires sont présentées avant souscription. {/* [À VALIDER PAR JURISTE] — tient lieu de CGV en attendant des CGV dédiées */}
      </p>

      <h2>6. Responsabilités</h2>
      <p>
        Le service est fourni « en l&apos;état ». Scribe IA met en œuvre des moyens raisonnables de
        disponibilité et de sécurité, sans garantie d&apos;absence totale d&apos;interruption ou
        d&apos;erreur. {/* [À VALIDER PAR JURISTE] */}
      </p>

      <h2>7. Résiliation</h2>
      <p>Vous pouvez cesser d&apos;utiliser le service à tout moment. Les modalités de suppression des données figurent dans la <a href="/confidentialite">politique de confidentialité</a>.</p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes conditions sont régies par le droit français. {/* [À VALIDER PAR JURISTE] */}</p>

      <p>Contact : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.</p>
    </Prose>
  );
}
```

> Note : garder la phrase « L’IA propose, l’humain valide » dans le code (le test l'accepte avec apostrophe droite ou typographique).

- [ ] **Step 4 : Lancer → passe**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: PASS (dont le test « mention IA »).

- [ ] **Step 5 : Build + commit**

```bash
git add "src/app/(legal)/cgu/page.tsx" tests/e2e/legal-pages.spec.ts
git commit -m "feat(legal): CGU + mention explicite du fonctionnement de l'IA"
```

---

## Task 4 : Hub Conformité + notice salariés

**Files:**
- Create: `src/app/(legal)/conformite/page.tsx`
- Modify: `tests/e2e/legal-pages.spec.ts`

**Interfaces:**
- Consumes : `Prose`, `LastUpdated` (Task 1).

- [ ] **Step 1 : Étendre le test — ajouter l'entrée + un test « liens vers les documents »**

Ajouter à `PUBLIC_LEGAL` :

```ts
  { path: "/conformite", marker: "Conformité" },
```

Ajouter un test dédié :

```ts
test("le hub conformité lie tous les documents", async ({ page }) => {
  await page.goto("/conformite");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Mentions légales" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Politique de confidentialité" })).toBeVisible();
  await expect(main.getByRole("link", { name: /conditions générales/i })).toBeVisible();
  await expect(main.getByRole("link", { name: /accord de sous-traitance/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /information des salariés/i })).toBeVisible();
});
```

- [ ] **Step 2 : Lancer → échoue**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: FAIL sur `/conformite`.

- [ ] **Step 3 : Créer `src/app/(legal)/conformite/page.tsx`**

Page de confiance (ton rassurant, factuel) + section notice salariés copiable.

```tsx
import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Conformité & RGPD — Scribe IA",
  description:
    "Hébergement en Europe, IA encadrée, validation humaine, vos droits : la conformité de Scribe IA.",
};

export default function ConformitePage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Conformité &amp; RGPD</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <p>
        Scribe IA est conçu pour un usage en équipe, dans le respect du RGPD et du droit du travail
        français. Voici nos engagements, en clair.
      </p>

      <h2>Hébergement et IA en Europe</h2>
      <p>
        Vos données sont hébergées dans l&apos;<strong>Union européenne</strong> (Francfort). La
        transcription et l&apos;analyse par IA passent par des entités <strong>européennes</strong>
        (OpenAI Ireland, Anthropic Ireland), <strong>sans entraînement</strong> sur vos contenus.
      </p>

      <h2>L’IA propose, l’humain valide</h2>
      <p>
        Aucune relance ni escalade n&apos;est déclenchée sans validation humaine. Scribe IA n&apos;est
        pas un outil de surveillance individuelle : il coordonne le travail d&apos;équipe, il ne note
        pas les personnes.
      </p>

      <h2>Vos droits, simplement</h2>
      <p>
        Accès, rectification, effacement, opposition, portabilité : écrivez à
        <a href="mailto:contact@scribeia.fr"> contact@scribeia.fr</a>. Détails dans la
        <a href="/confidentialite"> politique de confidentialité</a>.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li>Supabase — base de données et stockage (UE, Francfort)</li>
        <li>Vercel — hébergement de l&apos;application (UE)</li>
        <li>OpenAI Ireland Ltd — transcription (UE)</li>
        <li>Anthropic Ireland Ltd — extraction et synthèse (UE)</li>
        <li>Brevo — e-mails transactionnels (France)</li>
        <li>Stripe Payments Europe — paiement (UE)</li>
      </ul>

      <h2>Documents</h2>
      <ul>
        <li><a href="/mentions-legales">Mentions légales</a></li>
        <li><a href="/confidentialite">Politique de confidentialité</a></li>
        <li><a href="/cgu">Conditions générales d’utilisation</a></li>
        <li><a href="/conformite/dpa">Accord de sous-traitance (DPA) — imprimable</a></li>
      </ul>

      <h2 id="information-salaries">Notice d’information des salariés (modèle)</h2>
      <p>
        Avant de déployer Scribe IA, l&apos;employeur informe ses salariés (art. L.1222-4 du Code du
        travail) et, le cas échéant, consulte le CSE (art. L.2312-38, à partir de 50 salariés).
        Modèle à copier et adapter : {/* [À VALIDER PAR JURISTE] */}
      </p>
      <div className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">
        <p>
          « Notre entreprise utilise <strong>Scribe IA</strong> pour faciliter la coordination et la
          passation entre équipes. L&apos;outil traite des notes professionnelles (vocales ou écrites),
          des tâches et des accusés de lecture, dans le seul but d&apos;organiser le travail.
          Il ne s&apos;agit pas d&apos;un dispositif de surveillance individuelle ni d&apos;évaluation.
          Les données sont hébergées dans l&apos;Union européenne. Vous disposez de droits d&apos;accès,
          de rectification et d&apos;opposition, à exercer auprès de [responsable interne / DPO].
          [Le CSE a été informé/consulté le … le cas échéant.] »
        </p>
      </div>

      <p className="text-sm text-on-surface-variant">
        Kit complet (clause de règlement intérieur + checklist de consultation du CSE) disponible sur
        demande à <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.
      </p>
    </Prose>
  );
}
```

- [ ] **Step 4 : Lancer → passe**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 5 : Build + commit**

```bash
git add "src/app/(legal)/conformite/page.tsx" tests/e2e/legal-pages.spec.ts
git commit -m "feat(legal): hub conformité + notice d'information des salariés"
```

---

## Task 5 : DPA imprimable

**Files:**
- Create: `src/app/(legal)/conformite/dpa/page.tsx`
- Modify: `tests/e2e/legal-pages.spec.ts`

**Interfaces:**
- Consumes : `Prose`, `LastUpdated` (Task 1).

- [ ] **Step 1 : Étendre le test**

Ajouter à `PUBLIC_LEGAL` :

```ts
  { path: "/conformite/dpa", marker: "Accord de sous-traitance" },
```

- [ ] **Step 2 : Lancer → échoue**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: FAIL sur `/conformite/dpa`.

- [ ] **Step 3 : Créer `src/app/(legal)/conformite/dpa/page.tsx`**

DPA art. 28 + bouton d&apos;impression (le bouton est masqué à l&apos;impression via `print:hidden`).
⚠️ La page importe `PrintButton`, créé au **Step 4** : les deux fichiers doivent exister avant le run du Step 5 (ne pas lancer `npm run dev`/build entre les deux).

```tsx
import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";
import { PrintButton } from "@/components/legal/PrintButton";

export const metadata: Metadata = {
  title: "Accord de sous-traitance (DPA) — Scribe IA",
  description: "Accord de sous-traitance des données (art. 28 RGPD) — Scribe IA.",
};

export default function DpaPage() {
  return (
    <Prose>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <span className="eyebrow">Document contractuel</span>
        <PrintButton />
      </div>
      <h1 className="text-2xl font-semibold text-secondary">Accord de sous-traitance (DPA)</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <p>
        Le présent accord (art. 28 RGPD) encadre le traitement des données personnelles réalisé par
        <strong> Scribe IA</strong> (Allan Morjon, sous-traitant) pour le compte du
        <strong> client</strong> (responsable de traitement). {/* [À VALIDER PAR JURISTE] */}
      </p>

      <h2>1. Parties</h2>
      <ul>
        <li><strong>Responsable de traitement</strong> : le client — [Raison sociale, SIREN, adresse à compléter par le client].</li>
        <li><strong>Sous-traitant</strong> : Allan Morjon (Scribe IA), SIREN 878 736 784, 12 rue de la Pierre Lorraine, 77440 Congis-sur-Thérouanne.</li>
      </ul>

      <h2>2. Objet, durée, nature et finalité</h2>
      <p>
        Traitement des notes professionnelles, tâches et accusés de lecture aux fins de coordination
        d&apos;équipe et de passation, pour la durée du contrat de service.
      </p>

      <h2>3. Catégories de données et de personnes</h2>
      <p>
        Données d&apos;identification et de contenu professionnel des membres de l&apos;équipe du
        responsable de traitement (salariés, collaborateurs).
      </p>

      <h2>4. Obligations du sous-traitant</h2>
      <ul>
        <li>Traiter les données uniquement sur instructions documentées du responsable.</li>
        <li>Garantir la confidentialité des personnes autorisées à traiter les données.</li>
        <li>Mettre en œuvre les mesures de sécurité de l&apos;article 32 (voir Annexe 2).</li>
        <li>Recourir à des sous-traitants ultérieurs avec information préalable et droit d&apos;objection (Annexe 1).</li>
        <li>Assister le responsable pour les demandes d&apos;exercice de droits et les analyses d&apos;impact.</li>
        <li>Notifier toute violation de données dans les meilleurs délais.</li>
        <li>Supprimer ou restituer les données en fin de contrat.</li>
        <li>Permettre des audits raisonnables.</li>
      </ul>

      <h2>Annexe 1 — Sous-traitants ultérieurs</h2>
      <ul>
        <li>Supabase — base de données et stockage (UE)</li>
        <li>Vercel — hébergement (UE ; CCT)</li>
        <li>OpenAI Ireland Ltd — transcription (UE)</li>
        <li>Anthropic Ireland Ltd — extraction et synthèse (UE)</li>
        <li>Brevo — e-mails (France)</li>
        <li>Stripe Payments Europe — paiement (UE)</li>
      </ul>

      <h2>Annexe 2 — Mesures techniques et organisationnelles</h2>
      <ul>
        <li>Cloisonnement par organisation (Row Level Security).</li>
        <li>Accès aux fichiers par URL signées, stockage chiffré, transit chiffré (TLS).</li>
        <li>Authentification par sessions, mots de passe chiffrés.</li>
        <li>Hébergement en Union européenne.</li>
      </ul>

      <h2>Signatures</h2>
      <p>Pour le responsable de traitement : ______________________ (nom, date, signature)</p>
      <p>Pour le sous-traitant : Allan Morjon — Scribe IA ______________________ (date, signature)</p>
    </Prose>
  );
}
```

- [ ] **Step 4 : Créer `src/components/legal/PrintButton.tsx`** (client component — `window.print`)

```tsx
"use client";

// Bouton d'impression (→ PDF via le navigateur). Masqué à l'impression.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-pill bg-azure px-4 py-2 text-sm font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
    >
      Imprimer / PDF
    </button>
  );
}
```

- [ ] **Step 5 : Lancer → passe**

Run: `npx playwright test tests/e2e/legal-pages.spec.ts --project=mobile-chrome`
Expected: PASS.

- [ ] **Step 6 : Build + commit**

```bash
git add "src/app/(legal)/conformite/dpa/page.tsx" src/components/legal/PrintButton.tsx tests/e2e/legal-pages.spec.ts
git commit -m "feat(legal): DPA art. 28 imprimable (impression navigateur)"
```

---

## Task 6 : Case CGU à l’inscription (client + serveur)

**Files:**
- Create: `src/lib/auth/terms.ts`, `tests/e2e/signup-terms.spec.ts`
- Modify: `src/app/(auth)/signup/page.tsx`, `src/lib/auth/actions.ts` (après le check mot de passe, ~ligne 31)

**Interfaces:**
- Produces : `isTermsAccepted(value: FormDataEntryValue | null): boolean`.
- Consumes : `signup` action existante (`src/lib/auth/actions.ts`).

- [ ] **Step 1 : Écrire le test (unit + e2e) — échoue d'abord**

Create `tests/e2e/signup-terms.spec.ts` :

```ts
import { test, expect } from "@playwright/test";
import { isTermsAccepted } from "../../src/lib/auth/terms";

// Unit (sans navigateur) : table de vérité de l'acceptation des CGU.
test.describe("isTermsAccepted", () => {
  test("accepte uniquement les valeurs de case cochée", () => {
    expect(isTermsAccepted("on")).toBe(true);
    expect(isTermsAccepted("true")).toBe(true);
    expect(isTermsAccepted(null)).toBe(false);
    expect(isTermsAccepted("")).toBe(false);
    expect(isTermsAccepted("false")).toBe(false);
  });
});

// e2e : la case est présente et requise sur /signup (garde client).
test("la case CGU est requise à l'inscription", async ({ page }) => {
  await page.goto("/signup");
  const cb = page.getByRole("checkbox", { name: /j.accepte/i });
  await expect(cb).toBeVisible();
  await expect(cb).not.toBeChecked();
  const required = await cb.getAttribute("required");
  expect(required).not.toBeNull();
});
```

- [ ] **Step 2 : Lancer → échoue**

Run: `npx playwright test tests/e2e/signup-terms.spec.ts --project=mobile-chrome`
Expected: FAIL (module `terms` introuvable + pas de case sur /signup).

- [ ] **Step 3 : Créer `src/lib/auth/terms.ts`**

```ts
// Vérifie l'acceptation des CGU côté serveur (la case HTML `required` est contournable
// par un POST direct). Une case cochée envoie sa valeur ("on" par défaut, ou "true").
export function isTermsAccepted(value: FormDataEntryValue | null): boolean {
  if (typeof value !== "string") return false;
  return value === "on" || value === "true";
}
```

- [ ] **Step 4 : Lancer le test unit → passe**

Run: `npx playwright test tests/e2e/signup-terms.spec.ts -g "isTermsAccepted" --project=mobile-chrome`
Expected: PASS (le bloc unit).

- [ ] **Step 5 : Ajouter la vérif serveur dans `src/lib/auth/actions.ts`**

Importer en haut du fichier :

```ts
import { isTermsAccepted } from "@/lib/auth/terms";
```

Dans `signup`, juste APRÈS le bloc `if (password.length < 8) { ... }` (≈ ligne 31), AVANT `const supabase = await createClient();` :

```ts
  // Acceptation des CGU obligatoire (la case HTML `required` est contournable par POST direct).
  if (!isTermsAccepted(formData.get("accept_terms"))) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Vous devez accepter les CGU et la politique de confidentialité."),
    );
  }
```

- [ ] **Step 6 : Ajouter la case dans `src/app/(auth)/signup/page.tsx`**

Juste AVANT le `<button type="submit">` (≈ ligne 70), insérer :

```tsx
        <label className="flex items-start gap-2.5 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            name="accept_terms"
            required
            className="mt-0.5 h-5 w-5 shrink-0 rounded accent-primary"
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgu" target="_blank" className="font-medium text-primary underline">
              CGU
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" target="_blank" className="font-medium text-primary underline">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
```

(`Link` est déjà importé dans `signup/page.tsx`.)

- [ ] **Step 7 : Lancer tout le spec → passe**

Run: `npx playwright test tests/e2e/signup-terms.spec.ts --project=mobile-chrome`
Expected: PASS (unit + e2e case requise).

- [ ] **Step 8 : Build + lint + commit**

Run: `npm run build` puis `npm run lint`.

```bash
git add src/lib/auth/terms.ts "src/app/(auth)/signup/page.tsx" src/lib/auth/actions.ts tests/e2e/signup-terms.spec.ts
git commit -m "feat(legal): acceptation CGU obligatoire à l'inscription (client + serveur)"
```

---

## Vérification finale (après Task 6)

- [ ] `npm run build` vert — routes attendues en plus : `/mentions-legales`, `/confidentialite`, `/cgu`, `/conformite`, `/conformite/dpa`.
- [ ] `npm run lint` propre.
- [ ] `npx playwright test tests/e2e/legal-pages.spec.ts tests/e2e/signup-terms.spec.ts` — tout vert (mobile + desktop).
- [ ] Revue visuelle rapide (`npm run dev`) : les 5 pages s'affichent, footer cliquable, dark mode OK (toggle non présent hors dashboard → rendu clair, acceptable), DPA imprimable propre (aperçu impression).
- [ ] Tous les `[À VALIDER PAR JURISTE]` sont en place (grep `À VALIDER PAR JURISTE`).
- [ ] `check:rls` non concerné (aucune table).

## Notes d'exécution

- **Ne rien pousser / pas de PR** sans accord explicite d'Allan (règle d'or).
- Les textes restent des **brouillons à faire valider par un juriste** avant mise en ligne réelle.
- Hors scope (rappels) : suppression d'organisation (branche backend séparée), bannière cookies, génération PDF par librairie, choix outil analytics, kit CSE complet, purge automatique.
- À la fin : mettre à jour `snapshot.md` + `historique.md` (discipline de fin de session).
