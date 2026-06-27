import { defineConfig, devices } from "@playwright/test";

// Configuration Playwright pour les tests end-to-end de sécurité de Scribe.
// L'app est mobile-first stricte → on teste en priorité sur un viewport mobile.
//
// Lancer :  npx playwright test
//           npx playwright test --ui          (mode interactif)
//           npx playwright test --headed       (navigateur visible)
//
// La plupart des tests ont besoin de l'app lancée (webServer ci-dessous la démarre
// automatiquement) ET, pour les parcours d'inscription/connexion réels, d'un backend
// Supabase joignable. Les tests qui exigent le backend sont marqués @backend dans
// leur titre — on peut les exclure avec :  npx playwright test --grep-invert @backend

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  // Échec rapide en CI, plus tolérant en local.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Démarre `npm run dev` avant les tests si rien n'écoute déjà sur le port.
  // reuseExistingServer : si tu as déjà `npm run dev` ouvert, Playwright le réutilise.
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
