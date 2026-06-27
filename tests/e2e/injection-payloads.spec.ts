import { test, expect } from "@playwright/test";
import { SQLI_PAYLOADS, XSS_PAYLOADS } from "./payloads";

// ─────────────────────────────────────────────────────────────────────────────
// Robustesse des formulaires publics face aux charges malveillantes.
// Objectif : aucun crash serveur (500), aucune exécution de script, comportement
// stable quel que soit le contenu saisi. Vaut pour /signup et /login.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Formulaires — résistance aux charges (SQLi inoffensive)", () => {
  for (const payload of SQLI_PAYLOADS) {
    test(`@backend /login encaisse « ${payload.slice(0, 20)}… » sans 500`, async ({ page }) => {
      const responses: number[] = [];
      page.on("response", (r) => {
        if (r.request().method() === "POST") responses.push(r.status());
      });

      await page.goto("/login");
      await page.fill('input[name="email"]', payload);
      await page.fill('input[name="password"]', payload);
      await page.click('button[type="submit"]');
      await page.waitForLoadState("networkidle");

      // Supabase = requêtes paramétrées : l'injection est inoffensive, mais on
      // garde le test en filet (aucune 5xx ne doit apparaître).
      for (const status of responses) {
        expect(status, `statut POST ${status}`).toBeLessThan(500);
      }
    });
  }
});

test.describe("Formulaires — aucune exécution de script", () => {
  for (const payload of XSS_PAYLOADS) {
    test(`@backend /login + « ${payload.slice(0, 20)}… » n'exécute rien`, async ({ page }) => {
      let dialogFired = false;
      page.on("dialog", (d) => {
        dialogFired = true;
        d.dismiss().catch(() => {});
      });

      await page.goto("/login");
      await page.fill('input[name="email"]', payload);
      await page.fill('input[name="password"]', "x");
      await page.click('button[type="submit"]');
      await page.waitForLoadState("networkidle");

      expect(dialogFired, "aucun script ne doit s'exécuter").toBe(false);
    });
  }
});
