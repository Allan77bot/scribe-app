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
