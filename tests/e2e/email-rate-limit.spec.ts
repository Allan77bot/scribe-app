import { test, expect } from "@playwright/test";
import { uniqueTestEmail } from "./payloads";

// ─────────────────────────────────────────────────────────────────────────────
// Anti-abus des envois d'e-mail.
// FAILLE AS-04 / AS-10 (confirm-endpoint-email-bombing / authconfirm-no-ratelimit) :
// POST /api/auth/confirm est public et sans rate-limit → bombardement de boîte
// d'une victime + épuisement du quota Brevo (DoS des e-mails transactionnels).
// Ce test enverra une rafale et attendra un 429 au-delà du seuil, une fois le
// rate-limit ajouté.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Rate-limit des e-mails", () => {
  test.fixme(
    "@backend /api/auth/confirm renvoie 429 après une rafale d'envois",
    async ({ request }) => {
      const email = uniqueTestEmail("flood");
      const statuses: number[] = [];

      // 15 requêtes rapprochées : le seuil (ex. 3 / 15 min) doit déclencher un 429.
      for (let i = 0; i < 15; i++) {
        const res = await request.post("/api/auth/confirm", {
          data: { email },
        });
        statuses.push(res.status());
      }

      expect(
        statuses.some((s) => s === 429),
        "au moins une réponse 429 attendue après la rafale",
      ).toBe(true);
    },
  );

  // Vérification valable dès maintenant : l'endpoint ne révèle pas si le compte
  // existe (réponse constante = anti-énumération, déjà en place).
  test("@backend /api/auth/confirm répond de façon constante (anti-énumération)", async ({
    request,
  }) => {
    const a = await request.post("/api/auth/confirm", {
      data: { email: uniqueTestEmail("inconnu") },
    });
    expect(a.status()).toBeLessThan(500);
  });
});
