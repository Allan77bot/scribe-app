import { test, expect } from "@playwright/test";
import { EXPECTED_SECURITY_HEADERS } from "./payloads";

// ─────────────────────────────────────────────────────────────────────────────
// En-têtes de sécurité HTTP.
// FAILLE AS-21 (missing-security-headers) : corrigée le 2026-06-27 (next.config.ts
// async headers() + poweredByHeader: false). Ces tests sont désormais des garde-fous.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("En-têtes de sécurité", () => {
  for (const header of EXPECTED_SECURITY_HEADERS) {
    test(`la réponse expose ${header}`, async ({ request }) => {
      const res = await request.get("/login");
      const headers = res.headers();
      expect(headers[header], `${header} manquant`).toBeTruthy();
    });
  }

  // Vérification toujours valable : pas de header qui divulgue la stack.
  test("n'expose pas x-powered-by", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });
});
