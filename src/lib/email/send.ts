import "server-only";

// ── Client Brevo (ex-SendinBlue) — API REST transactionnelle ───────────────
// On gère nous-mêmes les e-mails transactionnels via Brevo (France, RGPD,
// 9k/mois gratuits) plutôt que via le SMTP intégré de Supabase. Cela nous donne
// le contrôle total du design (charte Atelier Klar) et de la délivrabilité.
//
// Note : on appelle l'endpoint REST `POST /v3/smtp/email` directement via fetch.
// Le SDK officiel `sib-api-v3-sdk` est déprécié (« no longer supported ») et son
// format UMD/AMD est incompatible avec le bundler Turbopack de Next 16. L'API
// REST est la voie supportée par Brevo et ne tire aucune dépendance.
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

function sender() {
  return {
    email: process.env.SENDER_EMAIL ?? "contact@atelierklar.fr",
    name: process.env.SENDER_NAME ?? "Scribe",
  };
}

// ── Gabarit HTML commun — charte Atelier Klar ──────────────────────────────
// Mobile-first : largeur fluide plafonnée à 520px, aucun débordement. Obsidienne
// #0A0708 en fond, ivoire #F0E8D6 pour le texte, bordeaux #6E1F2C pour le bouton
// d'action, ocre #A8804D pour l'accent.
function layout(opts: {
  preheader: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
}): string {
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0708;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0708;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:1px;color:#A8804D;">Scribe</span>
        </td></tr>
        <tr><td style="background:#141011;border-radius:16px;padding:32px 28px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;line-height:1.3;color:#F0E8D6;">${opts.heading}</h1>
          <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#F0E8D6;opacity:0.9;">
            ${opts.body}
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
            <tr><td style="border-radius:10px;background:#6E1F2C;">
              <a href="${opts.ctaUrl}" style="display:inline-block;padding:14px 28px;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;color:#F0E8D6;text-decoration:none;">${opts.ctaLabel}</a>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;color:#F0E8D6;opacity:0.5;word-break:break-all;">
            Ou copiez ce lien : ${opts.ctaUrl}
          </p>
        </td></tr>
        <tr><td style="padding:24px 4px 0;font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;color:#F0E8D6;opacity:0.4;">
          ${opts.footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function send(opts: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  tag: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    // Échec explicite côté serveur : sans clé, inutile d'appeler Brevo.
    throw new Error("BREVO_API_KEY manquante — e-mail non envoyé.");
  }

  const res = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: sender(),
      to: [{ email: opts.to, name: opts.toName }],
      subject: opts.subject,
      htmlContent: opts.html,
      textContent: opts.text,
      tags: [opts.tag],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status} : ${detail.slice(0, 300)}`);
  }
}

// ── 1. Confirmation d'e-mail (vérification à l'inscription) ─────────────────
export async function sendVerificationEmail(
  to: string,
  confirmUrl: string,
  displayName?: string,
): Promise<void> {
  const hello = displayName ? `Bonjour ${displayName},` : "Bonjour,";
  await send({
    to,
    toName: displayName,
    subject: "Confirmez votre adresse e-mail — Scribe",
    tag: "verification",
    html: layout({
      preheader: "Confirmez votre adresse pour activer votre équipe Scribe.",
      heading: "Confirmez votre adresse e-mail",
      body: `<p style="margin:0 0 12px;">${hello}</p>
             <p style="margin:0;">Bienvenue sur Scribe. Confirmez votre adresse pour activer votre équipe et commencer à coordonner les passations.</p>`,
      ctaLabel: "Confirmer mon adresse",
      ctaUrl: confirmUrl,
      footer:
        "Vous n'avez pas créé de compte Scribe ? Ignorez simplement cet e-mail.",
    }),
    text: `${hello}\n\nBienvenue sur Scribe. Confirmez votre adresse pour activer votre équipe :\n${confirmUrl}\n\nVous n'avez pas créé de compte ? Ignorez cet e-mail.`,
  });
}

// ── 2. Invitation à rejoindre une organisation ─────────────────────────────
export async function sendInvitationEmail(
  to: string,
  orgName: string,
  inviteUrl: string,
  inviterName?: string,
): Promise<void> {
  const who = inviterName ? `${inviterName} vous invite` : "Vous êtes invité";
  await send({
    to,
    subject: `Rejoignez « ${orgName} » sur Scribe`,
    tag: "invitation",
    html: layout({
      preheader: `${who} à rejoindre ${orgName} sur Scribe.`,
      heading: `Rejoignez « ${orgName} »`,
      body: `<p style="margin:0;">${who} à rejoindre l'équipe <strong style="color:#A8804D;">${orgName}</strong> sur Scribe, l'outil de coordination d'équipe. Acceptez l'invitation pour créer votre accès.</p>`,
      ctaLabel: "Rejoindre l'équipe",
      ctaUrl: inviteUrl,
      footer:
        "Cette invitation vous était destinée. Si ce n'est pas le cas, ignorez cet e-mail.",
    }),
    text: `${who} à rejoindre « ${orgName} » sur Scribe.\n\nAcceptez l'invitation :\n${inviteUrl}`,
  });
}

// ── 3. Réinitialisation de mot de passe ────────────────────────────────────
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  displayName?: string,
): Promise<void> {
  const hello = displayName ? `Bonjour ${displayName},` : "Bonjour,";
  await send({
    to,
    toName: displayName,
    subject: "Réinitialisez votre mot de passe — Scribe",
    tag: "password-reset",
    html: layout({
      preheader: "Lien pour réinitialiser votre mot de passe Scribe.",
      heading: "Réinitialisez votre mot de passe",
      body: `<p style="margin:0 0 12px;">${hello}</p>
             <p style="margin:0;">Une réinitialisation de mot de passe a été demandée pour ce compte. Ce lien est valable une heure.</p>`,
      ctaLabel: "Choisir un nouveau mot de passe",
      ctaUrl: resetUrl,
      footer:
        "Vous n'avez rien demandé ? Votre mot de passe reste inchangé, ignorez cet e-mail.",
    }),
    text: `${hello}\n\nRéinitialisez votre mot de passe (lien valable 1 h) :\n${resetUrl}\n\nVous n'avez rien demandé ? Ignorez cet e-mail.`,
  });
}
