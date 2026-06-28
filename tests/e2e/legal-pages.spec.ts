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
