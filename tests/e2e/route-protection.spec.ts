import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Protection des routes — un visiteur NON connecté ne doit pas atteindre l'app.
// Réf. : src/lib/supabase/middleware.ts (garde /dashboard) + finding AS info
//        middleware-allowlist-narrow (la liste blanche ne couvre que /dashboard).
// ─────────────────────────────────────────────────────────────────────────────

const PROTECTED_DASHBOARD = [
  "/dashboard",
  "/dashboard/capture",
  "/dashboard/tasks",
  "/dashboard/team",
  "/dashboard/settings",
  "/dashboard/report",
  "/dashboard/handover",
];

test.describe("Routes protégées /dashboard", () => {
  for (const path of PROTECTED_DASHBOARD) {
    test(`@backend ${path} redirige vers /login si non connecté`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("Routes publiques accessibles", () => {
  for (const path of ["/login", "/signup"]) {
    test(`${path} est accessible sans session`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
    });
  }
});

test.describe("Surface hors /dashboard", () => {
  // FAILLE info (middleware-allowlist-narrow) : /onboarding n'est PAS couvert par la
  // garde du middleware (qui ne protège que /dashboard). La page DOIT donc se garder
  // elle-même (getUser côté serveur) et rediriger un visiteur non connecté.
  // Active ce test pour confirmer la garde applicative.
  test.fixme("@backend /onboarding redirige un visiteur non connecté", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });
});
