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
