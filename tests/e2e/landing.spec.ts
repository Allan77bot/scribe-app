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
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("la section comment ça marche détaille les 3 étapes", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#comment-ca-marche");
    await expect(section).toBeVisible();
    await expect(section.getByText("Dictez en fin de poste")).toBeVisible();
    await expect(section.getByText("L'IA propose, vous validez")).toBeVisible();
    await expect(section.getByText("La relève reçoit tout")).toBeVisible();
  });

  test("les piliers et la réassurance RGPD sont présents", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Vous gardez la main")).toBeVisible();
    await expect(page.getByText("La mémoire de l'équipe")).toBeVisible();
    await expect(page.getByText("Zéro friction")).toBeVisible();
    await expect(
      page.getByText(/Vos données restent en Europe/),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Confidentialité" }).first(),
    ).toHaveAttribute("href", "/confidentialite");
    await expect(
      page.getByRole("link", { name: "Conformité" }).first(),
    ).toHaveAttribute("href", "/conformite");
  });

  test("le CTA final invite à créer l'équipe", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Essayez sur votre prochaine relève." }),
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("link", { name: "Créer mon équipe" }).last(),
    ).toHaveAttribute("href", "/signup");
  });

  test("le titre de la page mentionne la promesse", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Rien ne se perd/);
  });

  test("aucun débordement horizontal sur mobile (393px)", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("mouvement autorisé : les sections sous le hero se révèlent au scroll", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Le dernier conteneur animé (CTA final) doit atteindre l'opacité pleine.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const els = document.querySelectorAll(".reveal");
          const last = els[els.length - 1];
          return last ? parseFloat(getComputedStyle(last).opacity) : 0;
        }),
      )
      .toBeGreaterThan(0.9);
  });

  test("reduced-motion : le contenu animé reste visible (pas bloqué à opacité 0)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const opacity = await page.evaluate(() => {
      const el = document.querySelector(".reveal");
      return el ? parseFloat(getComputedStyle(el).opacity) : 1;
    });
    expect(opacity).toBe(1);
  });
});
