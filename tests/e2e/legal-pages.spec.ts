import { test, expect } from "@playwright/test";

// Pages légales publiques — accessibles sans session, footer présent, mobile-first.
const PUBLIC_LEGAL = [
  { path: "/mentions-legales", marker: "Mentions légales" },
  { path: "/confidentialite", marker: "Politique de confidentialité" },
  { path: "/cgu", marker: "Conditions générales" },
  { path: "/conformite", marker: "Conformité" },
  { path: "/conformite/dpa", marker: "Accord de sous-traitance" },
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

test("les CGU mentionnent explicitement le fonctionnement de l'IA", async ({ page }) => {
  await page.goto("/cgu");
  await expect(page.getByText(/l['']IA propose, l['']humain valide/i)).toBeVisible();
});

test("la landing montre le footer légal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Mentions légales" })).toBeVisible();
});

test("le hub conformité lie tous les documents", async ({ page }) => {
  await page.goto("/conformite");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Mentions légales" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Politique de confidentialité" })).toBeVisible();
  await expect(main.getByRole("link", { name: /conditions générales/i })).toBeVisible();
  await expect(main.getByRole("link", { name: /accord de sous-traitance/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /information des salariés/i })).toBeVisible();
});
