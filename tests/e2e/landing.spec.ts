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

  test("la section comment ça marche détaille les 3 étapes", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#comment-ca-marche");
    await expect(section).toBeVisible();
    await expect(section.getByText("Dictez en fin de poste")).toBeVisible();
    await expect(section.getByText("L'IA propose, vous validez")).toBeVisible();
    await expect(section.getByText("La relève reçoit tout")).toBeVisible();
  });
});
