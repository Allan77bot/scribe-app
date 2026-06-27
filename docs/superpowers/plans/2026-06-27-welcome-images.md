# Images de bienvenue (OG + onboarding) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Doter Scribe d'un aperçu Open Graph soigné (partage de lien) et de deux illustrations de bienvenue dans l'onboarding, sans toucher à la base.

**Architecture:** L'OG est une carte 1200×630 générée à la volée par `next/og` (Satori) via la convention de fichier `opengraph-image.tsx`, plus un bloc `openGraph`/`twitter` dans le layout racine. L'onboarding gagne un composant `OnboardingHero` (bandeau plein cadre) monté à 3 endroits du wizard, alimenté par 2 PNG flat-géométriques générés par IA (Higgsfield) et stockés dans `public/`.

**Tech Stack:** Next.js 16 (Turbopack), `next/og` (Satori), `next/image`, Tailwind v4 (`@theme`), Playwright (e2e existant), MCP Higgsfield (génération d'images).

## Global Constraints

- **Aucune table, aucune RLS, aucune migration** — chantier front + assets uniquement ; `check:rls` non requis.
- Code et noms en **anglais** ; commentaires et docs en **français**.
- **Mobile-first strict** : `overflow-x: hidden`, rien qui dépasse (cible 393px).
- Copy UI au **vouvoiement** (« vous »), voix active.
- Jamais de `service_role` ni de secret côté client.
- **Slogan OG exact :** « L'IA transforme vos notes en tâches suivies pour l'équipe. »
- **Sous-ligne OG exacte :** « Dictez, l'IA extrait et suit — rien ne se perd. »
- **metadataBase exact :** `process.env.NEXT_PUBLIC_SITE_URL ?? "https://scribe-app-beta.vercel.app"`
- **Palette de marque (hex fixes, indépendants du thème) :** cobalt `#2A4FB0`, cyan `#22D3EE`, marine `#12132a`, paper `#f8f7f4`. ⚠️ Les tokens Tailwind `primary`/`azure` **changent en dark mode** — pour tout fond censé être identique clair/sombre, utiliser les **hex** ci-dessus, pas les tokens.
- Logos disponibles : `public/logos/scribe-logo-white-cyan.png` (512×512), `scribe-mark-white.png` (237×308).

## File Structure

**Créés :**
- `src/app/opengraph-image.tsx` — générateur de la carte OG (Satori). Responsabilité unique : dessiner l'image 1200×630.
- `src/app/twitter-image.tsx` — re-export du générateur OG (carte Twitter `summary_large_image`).
- `src/app/_og/Manrope.ttf` — police Manrope (variable) pour Satori.
- `src/app/_og/logo.png` — copie du logo, colocalisée pour chargement via `import.meta.url`.
- `src/components/OnboardingHero.tsx` — bandeau héro plein cadre (fond de marque fixe + `next/image`).
- `public/illustrations/onboarding-welcome.png` — illustration accueil (IA).
- `public/illustrations/onboarding-ready.png` — illustration « Prêt » (IA).
- `tests/e2e/og-meta.spec.ts` — test e2e : balises OG présentes + route image servie.

**Modifiés :**
- `src/app/layout.tsx` — ajout `metadataBase` + `openGraph` + `twitter`.
- `src/components/OnboardingWizard.tsx` — import + 3 bandeaux à la place des emojis.

---

## Task 1 : Carte Open Graph + métadonnées de partage

**Files:**
- Create: `tests/e2e/og-meta.spec.ts`
- Create: `src/app/_og/Manrope.ttf`, `src/app/_og/logo.png`
- Create: `src/app/opengraph-image.tsx`
- Create: `src/app/twitter-image.tsx`
- Modify: `src/app/layout.tsx:14-26` (bloc `metadata`)

**Interfaces:**
- Consumes: rien (premier task).
- Produces: route `GET /opengraph-image` → `image/png` 1200×630 ; balises `<meta property="og:image">`, `og:title`, `twitter:card` sur les pages publiques.

- [ ] **Step 1 : Écrire le test e2e qui échoue**

Créer `tests/e2e/og-meta.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

// Aperçu Open Graph (partage de lien). Routes publiques → pas de backend requis.
test.describe("Open Graph", () => {
  test("la page d'accueil expose les balises og:image et og:title", async ({ page }) => {
    await page.goto("/");
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
    await expect(ogImage).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Scribe/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("la route /opengraph-image renvoie une image PNG", async ({ request }) => {
    const res = await request.get("/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier qu'il échoue**

Run: `npx playwright test og-meta --project=mobile-chrome`
Expected: FAIL (`og:image` absent → count 0 ; `/opengraph-image` → 404).

- [ ] **Step 3 : Récupérer la police Manrope (variable) pour Satori**

Manrope est la police du design system. Source fiable (dépôt Google Fonts) :

```bash
mkdir -p src/app/_og
curl -fSL -o src/app/_og/Manrope.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf"
# Vérifier que c'est un vrai TTF (pas une page d'erreur HTML) :
node -e "const b=require('fs').readFileSync('src/app/_og/Manrope.ttf'); if(b.length<50000||b.readUInt32BE(0)!==0x00010000&&b.toString('ascii',0,4)!=='true'){throw new Error('TTF invalide, taille '+b.length)} console.log('Manrope.ttf OK', Math.round(b.length/1024)+'KB')"
```

Si l'URL échoue (dépôt réorganisé) : récupérer un autre Manrope `.ttf` valide et le placer au même chemin ; le contrôle node ci-dessus doit passer.

- [ ] **Step 4 : Colocaliser le logo pour le chargement Satori**

Satori n'accède pas au filesystem : on charge le logo via `import.meta.url`. On le copie à côté de la route.

```bash
cp public/logos/scribe-logo-white-cyan.png src/app/_og/logo.png
```

- [ ] **Step 5 : Créer le générateur de carte OG**

Créer `src/app/opengraph-image.tsx` :

```tsx
import { ImageResponse } from "next/og";

// Carte Open Graph générée à la volée (moteur Satori). C'est l'aperçu riche
// affiché quand on partage un lien Scribe (LinkedIn, SMS, cold email, accueil).
// Police + logo chargés via import.meta.url (pattern officiel Next : Satori
// n'a pas accès au filesystem). Fond en HEX fixes (indépendant du thème app).
export const runtime = "nodejs";
export const alt =
  "Scribe — l'IA transforme vos notes en tâches suivies pour l'équipe.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [manrope, logo] = await Promise.all([
    fetch(new URL("./_og/Manrope.ttf", import.meta.url)).then((r) =>
      r.arrayBuffer(),
    ),
    fetch(new URL("./_og/logo.png", import.meta.url)).then((r) =>
      r.arrayBuffer(),
    ),
  ]);
  const logoSrc = `data:image/png;base64,${Buffer.from(logo).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Manrope",
          background:
            "linear-gradient(135deg, #2A4FB0 0%, #1B2A66 55%, #12132A 100%)",
          position: "relative",
        }}
      >
        {/* Accent cyan, signature de marque */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(34,211,238,0.18)",
            display: "flex",
          }}
        />
        {/* En-tête : mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={104} height={104} alt="" />
          <div
            style={{ fontSize: 56, fontWeight: 800, color: "#FFFFFF" }}
          >
            Scribe
          </div>
        </div>
        {/* Bloc message */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            L&apos;IA transforme vos notes en tâches suivies pour l&apos;équipe.
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "#22D3EE",
              marginTop: 28,
            }}
          >
            Dictez, l&apos;IA extrait et suit — rien ne se perd.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: manrope, weight: 600, style: "normal" },
        { name: "Manrope", data: manrope, weight: 800, style: "normal" },
      ],
    },
  );
}
```

- [ ] **Step 6 : Créer la carte Twitter (re-export DRY)**

Créer `src/app/twitter-image.tsx` :

```tsx
// Réutilise le même rendu que l'Open Graph (carte summary_large_image).
export { default, runtime, alt, size, contentType } from "./opengraph-image";
```

- [ ] **Step 7 : Brancher les métadonnées dans le layout racine**

Modifier le bloc `metadata` de `src/app/layout.tsx` (lignes ~14-26) — ajouter `metadataBase`, `openGraph`, `twitter` (Next câble `og:image`/`twitter:image` automatiquement depuis les fichiers de convention) :

```tsx
export const metadata: Metadata = {
  title: "Scribe — coordination d'équipe",
  description:
    "Transformez vos notes vocales et écrites en coordination d'équipe : tâches suivies, accusés de lecture, rapport de passation automatique.",
  manifest: "/manifest.webmanifest",
  // URL absolue de référence pour résoudre les aperçus (og:image, etc.).
  // Repli sur le domaine Vercel de prod si la variable n'est pas posée.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://scribe-app-beta.vercel.app",
  ),
  appleWebApp: {
    capable: true,
    title: "Scribe",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    siteName: "Scribe",
    locale: "fr_FR",
    url: "/",
    title: "Scribe — l'IA transforme vos notes en tâches suivies pour l'équipe",
    description: "Dictez, l'IA extrait et suit — rien ne se perd.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scribe — coordination d'équipe par l'IA",
    description: "Dictez, l'IA extrait et suit — rien ne se perd.",
  },
  // Icônes servies par les conventions de fichiers Next : src/app/icon.svg
  // (favicon vectoriel net) + src/app/apple-icon.png (180px). PWA : manifest.ts.
};
```

- [ ] **Step 8 : Lancer le test, vérifier qu'il passe**

Run: `npx playwright test og-meta --project=mobile-chrome`
Expected: PASS (2 tests verts).

- [ ] **Step 9 : Inspecter l'image générée à l'œil**

Run (serveur dev lancé) :
```bash
curl -fsS -o /tmp/og.png http://localhost:3000/opengraph-image && node -e "const b=require('fs').readFileSync('/tmp/og.png'); console.log('PNG', b.readUInt32BE(16)+'x'+b.readUInt32BE(20), Math.round(b.length/1024)+'KB')"
```
Expected: `PNG 1200x630`. Ouvrir `/tmp/og.png` : logo net, « Scribe », slogan blanc lisible, sous-ligne cyan, accent cyan visible. Si le titre ne ressort pas assez gras (police variable), remplacer `Manrope.ttf` par un Manrope-ExtraBold statique et re-vérifier.

- [ ] **Step 10 : Vérifier le build complet**

Run: `npm run build`
Expected: vert. La route `/opengraph-image` (et `/twitter-image`) apparaît dans la liste.

- [ ] **Step 11 : Lint**

Run: `npm run lint`
Expected: vert.

- [ ] **Step 12 : Commit**

```bash
git add src/app/opengraph-image.tsx src/app/twitter-image.tsx src/app/_og src/app/layout.tsx tests/e2e/og-meta.spec.ts
git commit -m "feat(og): carte Open Graph + métadonnées de partage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2 : Générer les 2 illustrations d'onboarding (IA, boucle avec Allan)

> ⚠️ Task **interactif** (génération MCP Higgsfield + validation d'Allan) — à exécuter **en session**, pas par un subagent autonome. Pas de test automatisé : le livrable = 2 PNG validés, aux bonnes dimensions.

**Files:**
- Create: `public/illustrations/onboarding-welcome.png`
- Create: `public/illustrations/onboarding-ready.png`

**Interfaces:**
- Consumes: rien.
- Produces: 2 PNG paysage (~1280×720, ratio 16:9) servis depuis `/illustrations/...` ; consommés par `OnboardingHero` (Task 3).

- [ ] **Step 1 : Charger les outils Higgsfield**

ToolSearch query: `select:mcp__higgsfield__generate_image,mcp__higgsfield__job_status,mcp__higgsfield__show_generations,mcp__higgsfield__models_explore`

- [ ] **Step 2 : Générer les candidats « accueil »**

Prompt (style flat géométrique de marque, **aucun texte** dans l'image — règle anti-déformation) :

> Flat geometric vector illustration, modern SaaS style. Theme: a small team coordinating in sync — simple geometric human silhouettes connected by clean lines, a voice waveform morphing into checklist/task cards. Brand palette ONLY: cobalt blue #2A4FB0, bright cyan #22D3EE, warm paper cream #F8F7F4, with navy accents. Soft cream-to-cobalt background that fills the frame. Warm, optimistic, professional B2B. Clean shapes, generous negative space. NO text, NO letters, NO words. 16:9 landscape.

Générer 3-4 variantes (`generate_image`), suivre via `job_status`.

- [ ] **Step 3 : Générer les candidats « Prêt »**

> Flat geometric vector illustration, modern SaaS style. Theme: "all set, ready to go" — upward geometric momentum, a single clear checkmark or pennant, a sense of launch and completion. Brand palette ONLY: cobalt blue #2A4FB0, bright cyan #22D3EE, warm paper cream #F8F7F4, navy accents. Soft cream-to-cobalt background filling the frame. Confident, celebratory but professional. Clean shapes, negative space. NO text, NO letters, NO words. 16:9 landscape.

- [ ] **Step 4 : Présenter à Allan et faire valider**

Afficher les candidats (`show_generations` / liens). Allan choisit **1 accueil + 1 Prêt**. Vérifier la cohérence stylistique entre les deux (même langage flat, même palette). Re-générer si besoin.

- [ ] **Step 5 : Récupérer et placer les retenues**

Télécharger les 2 images choisies dans `public/illustrations/` aux noms exacts `onboarding-welcome.png` et `onboarding-ready.png`. Vérifier dimensions et poids :

```bash
node -e "for(const f of ['public/illustrations/onboarding-welcome.png','public/illustrations/onboarding-ready.png']){const b=require('fs').readFileSync(f);console.log(f, b.readUInt32BE(16)+'x'+b.readUInt32BE(20), Math.round(b.length/1024)+'KB')}"
```
Expected: ~16:9, idéalement < 300KB chacune (compresser si nettement au-dessus).

- [ ] **Step 6 : Commit**

```bash
git add public/illustrations/onboarding-welcome.png public/illustrations/onboarding-ready.png
git commit -m "feat(onboarding): illustrations de bienvenue + prêt (IA, validées)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3 : Composant OnboardingHero + intégration au wizard

**Files:**
- Create: `src/components/OnboardingHero.tsx`
- Modify: `src/components/OnboardingWizard.tsx` (import en tête ; lignes ~187, ~213-215, ~378-380)

**Interfaces:**
- Consumes: `OnboardingHero({ src: string, alt: string })` ; les 2 PNG de Task 2.
- Produces: bandeaux héro montés sur les écrans accueil (admin + member) et « Prêt ».

- [ ] **Step 1 : Créer le composant bandeau**

Créer `src/components/OnboardingHero.tsx` :

```tsx
import Image from "next/image";

// Bandeau héro d'onboarding : illustration de bienvenue en tête de carte.
// Le fond est un dégradé de marque en HEX FIXES (cobalt→cyan) : il NE doit PAS
// suivre le thème (les tokens primary/azure changent en dark) → une seule image
// suffit en clair comme en sombre. Plein cadre dans la carte parente
// (rounded-card p-6) via les marges négatives -mx-6 -mt-6.
export default function OnboardingHero({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div
      className="relative -mx-6 -mt-6 mb-5 h-44 overflow-hidden rounded-t-card"
      style={{
        background: "linear-gradient(135deg, #2A4FB0 0%, #22D3EE 100%)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 480px) 100vw, 448px"
        className="object-cover"
      />
    </div>
  );
}
```

- [ ] **Step 2 : Importer le composant dans le wizard**

Dans `src/components/OnboardingWizard.tsx`, ajouter sous l'import de `ColorPicker` :

```tsx
import OnboardingHero from "@/components/OnboardingHero";
```

- [ ] **Step 3 : Bandeau sur l'accueil manager (step 0, admin)**

Remplacer (vers la ligne 185-192) :

```tsx
          <div key="m0" className="scribe-in flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-secondary">Bienvenue 👋</h2>
```

par :

```tsx
          <div key="m0" className="scribe-in flex flex-col gap-4">
            <OnboardingHero
              src="/illustrations/onboarding-welcome.png"
              alt="Bienvenue sur Scribe"
            />
            <div>
              <h2 className="text-xl font-semibold text-secondary">Bienvenue</h2>
```

- [ ] **Step 4 : Bandeau sur l'accueil employé (step 0, member)**

Remplacer (vers la ligne 212-215) :

```tsx
          <div key="e0" className="scribe-in flex flex-col gap-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-azure text-2xl">
              👋
            </div>
```

par :

```tsx
          <div key="e0" className="scribe-in flex flex-col gap-4 text-center">
            <OnboardingHero
              src="/illustrations/onboarding-welcome.png"
              alt="Vous rejoignez une équipe sur Scribe"
            />
```

- [ ] **Step 5 : Bandeau sur l'écran « Prêt » (step 3)**

Remplacer (vers la ligne 377-380) :

```tsx
          <div key="s3" className="scribe-in flex flex-col gap-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-azure text-2xl">
              🚀
            </div>
```

par :

```tsx
          <div key="s3" className="scribe-in flex flex-col gap-4 text-center">
            <OnboardingHero
              src="/illustrations/onboarding-ready.png"
              alt="Tout est prêt sur Scribe"
            />
```

- [ ] **Step 6 : Build**

Run: `npm run build`
Expected: vert (nombre de routes inchangé).

- [ ] **Step 7 : Lint**

Run: `npm run lint`
Expected: vert.

- [ ] **Step 8 : Vérification visuelle (clair ET sombre, 393px)**

Avec le serveur dev lancé, se connecter à un compte dont l'onboarding n'est pas terminé, ouvrir `/onboarding` à 393px de large.
Contrôler, sur **les deux parcours** (admin + member) et l'écran « Prêt », en **thème clair PUIS sombre** (bascule via le menu compte / `data-theme`) :
- le bandeau s'affiche plein cadre en tête de carte, coins hauts arrondis, ~176px ;
- l'illustration est nette, le rendu **identique en clair et en sombre** ;
- **aucun débordement horizontal** ; les boutons restent ≥ 44px.

Capturer 2 screenshots (clair + sombre) pour la trace.

- [ ] **Step 9 : Commit**

```bash
git add src/components/OnboardingHero.tsx src/components/OnboardingWizard.tsx
git commit -m "feat(onboarding): bandeaux héro de bienvenue à la place des emojis

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (fait)

- **Couverture spec :** OG (carte + métadonnées) = Task 1 ; illustrations IA = Task 2 ; bandeaux onboarding + dark mode = Task 3. Hors-périmètre (aperçu invitation, illu du tour) non planifiés — conforme.
- **Placeholders :** aucun « TBD/TODO » ; chaque step a sa commande/son code. Les seules inconnues maîtrisées (URL de police, sortie IA) ont un **gate de vérification** explicite.
- **Cohérence des types/noms :** `OnboardingHero({ src, alt })` défini en Task 3 Step 1, consommé identiquement aux steps 3-5 ; chemins d'images `/illustrations/onboarding-welcome.png` & `-ready.png` cohérents entre Task 2 et Task 3 ; slogan/sous-ligne identiques entre la carte OG (Task 1 Step 5) et les métadonnées (Step 7).
- **Correctif dark mode** intégré : fond de bandeau en hex fixes, pas en tokens (qui flippent).
