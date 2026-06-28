import { test, expect } from "@playwright/test";
import { isTermsAccepted } from "../../src/lib/auth/terms";

// Unit (sans navigateur) : table de vérité de l'acceptation des CGU.
test.describe("isTermsAccepted", () => {
  test("accepte uniquement les valeurs de case cochée", () => {
    expect(isTermsAccepted("on")).toBe(true);
    expect(isTermsAccepted("true")).toBe(true);
    expect(isTermsAccepted(null)).toBe(false);
    expect(isTermsAccepted("")).toBe(false);
    expect(isTermsAccepted("false")).toBe(false);
  });
});

// e2e : la case est présente et requise sur /signup (garde client).
test("la case CGU est requise à l'inscription", async ({ page }) => {
  await page.goto("/signup");
  const cb = page.getByRole("checkbox", { name: /j.accepte/i });
  await expect(cb).toBeVisible();
  await expect(cb).not.toBeChecked();
  const required = await cb.getAttribute("required");
  expect(required).not.toBeNull();
});
