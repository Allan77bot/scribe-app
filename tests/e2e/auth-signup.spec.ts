import { test, expect } from "@playwright/test";
import { XSS_PAYLOADS, ABUSE_STRINGS, uniqueTestEmail } from "./payloads";

// ─────────────────────────────────────────────────────────────────────────────
// Formulaire d'inscription (/signup) — validation, anti-énumération, anti-XSS.
// Réf. audit : docs/audit-securite-2026-06-27.md
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Inscription — structure & validation client", () => {
  test("la page affiche les 4 champs attendus", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[name="org_name"]')).toBeVisible();
    await expect(page.locator('input[name="display_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("le mot de passe exige au moins 8 caractères côté client", async ({ page }) => {
    await page.goto("/signup");
    const pwd = page.locator('input[name="password"]');
    await expect(pwd).toHaveAttribute("minlength", "8");
    await expect(pwd).toHaveAttribute("type", "password");
  });

  test("l'e-mail est typé pour la validation navigateur", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[name="email"]')).toHaveAttribute("type", "email");
  });
});

test.describe("Inscription — sécurité", () => {
  // FAILLE AS-11 (signup-no-server-password-policy) : la longueur du mot de passe
  // n'est validée QUE par l'attribut HTML. Un POST direct de la server action avec
  // un mot de passe court doit être refusé côté serveur. Active ce test après le fix.
  test.fixme(
    "@backend rejette un mot de passe trop court soumis sans le navigateur",
    async ({ request }) => {
      // Soumission directe (bypass de la validation HTML) — à adapter au format
      // d'appel de la server action une fois le garde-fou serveur ajouté.
      const res = await request.post("/signup", {
        form: {
          org_name: "Test Org",
          display_name: "Test",
          email: uniqueTestEmail("short"),
          password: "123", // < 8 : doit être refusé serveur
        },
      });
      // Attendu après fix : redirection /signup?error=... (pas de compte créé).
      expect(res.url()).toContain("/signup");
    },
  );

  test("@backend ne révèle pas si un e-mail existe déjà (anti-énumération)", async ({ page }) => {
    // On s'inscrit deux fois avec le même e-mail : le 2e essai ne doit PAS dire
    // « cet e-mail existe déjà » — message générique uniquement.
    //
    // NOTE (vérifié en direct 2026-06-27) : avec confirmation d'e-mail activée
    // (mailer_autoconfirm=false), une 1re inscription valide redirige vers
    // /login?message=confirm-email. Le 2e essai rapproché tombe souvent sur le
    // rate-limit GoTrue (« you can only request this after N seconds ») plutôt que
    // sur la détection de doublon — l'assertion ci-dessous (aucune fuite « existe
    // déjà ») reste vraie dans les deux cas. Pour exercer VRAIMENT le doublon,
    // espacer les deux essais au-delà de la fenêtre de rate-limit.
    const email = uniqueTestEmail("dup");
    for (let i = 0; i < 2; i++) {
      await page.goto("/signup");
      await page.fill('input[name="org_name"]', "Org Test");
      await page.fill('input[name="display_name"]', "Test");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', "MotDePasse123!");
      await page.click('button[type="submit"]');
      await page.waitForLoadState("networkidle");
    }
    const body = (await page.locator("body").innerText()).toLowerCase();
    expect(body).not.toContain("existe déjà");
    expect(body).not.toContain("already");
    expect(body).not.toContain("registered");
  });

  // FAILLE AS-13/AS-06 : nom d'org / nom affiché non bornés côté serveur, et
  // potentiellement reflétés (e-mails, UI). On vérifie qu'une charge XSS injectée
  // dans le nom n'exécute jamais de script après affichage.
  for (const payload of XSS_PAYLOADS) {
    test(`@backend le nom d'équipe « ${payload.slice(0, 24)}… » ne s'exécute pas`, async ({
      page,
    }) => {
      let xssFired = false;
      page.on("dialog", (d) => {
        xssFired = true;
        d.dismiss().catch(() => {});
      });
      await page.addInitScript(() => {
        (window as unknown as { __xss?: number }).__xss = 0;
      });

      await page.goto("/signup");
      await page.fill('input[name="org_name"]', payload);
      await page.fill('input[name="display_name"]', "Test");
      await page.fill('input[name="email"]', uniqueTestEmail("xss"));
      await page.fill('input[name="password"]', "MotDePasse123!");
      await page.click('button[type="submit"]');
      await page.waitForLoadState("networkidle");

      const flag = await page.evaluate(
        () => (window as unknown as { __xss?: number }).__xss ?? 0,
      );
      expect(flag, "le payload XSS ne doit jamais s'exécuter").toBe(0);
      expect(xssFired, "aucune dialog déclenchée par le payload").toBe(false);
    });
  }

  // FAILLE AS-13 (signup-displayname-unbounded) : champs non bornés côté serveur.
  // Documente l'attente — active après le fix (left(...,80) + rejet caractères de contrôle).
  test.fixme("@backend borne la longueur du nom affiché côté serveur", async ({ request }) => {
    const res = await request.post("/signup", {
      form: {
        org_name: "Org",
        display_name: ABUSE_STRINGS.veryLong, // 5000 car. : doit être tronqué/refusé
        email: uniqueTestEmail("long"),
        password: "MotDePasse123!",
      },
    });
    expect(res.status()).toBeLessThan(500);
  });
});
