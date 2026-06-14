import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail, sendPasswordResetEmail } from "./send";

// Orchestration : on génère le lien d'action via le client admin Supabase
// (generateLink), puis on le délivre nous-mêmes via Brevo. Supabase ne fabrique
// que le jeton signé ; l'envoi du mail nous appartient (règle : pas de SMTP
// Supabase). Les erreurs ne doivent jamais casser le flux appelant (signup) :
// on les remonte en booléen, le détail est loggé côté serveur.

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

// Génère le lien de confirmation d'inscription et l'envoie via Brevo.
// `password` est requis par Supabase pour un generateLink de type « signup ».
export async function dispatchVerificationEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { redirectTo: `${siteUrl()}/login?message=email-confirmed` },
    });

    if (error || !data.properties?.action_link) {
      console.error("[email:verification] generateLink", error?.message);
      return false;
    }

    await sendVerificationEmail(email, data.properties.action_link, displayName);
    return true;
  } catch (err) {
    console.error(
      "[email:verification]",
      err instanceof Error ? err.message : String(err),
    );
    return false;
  }
}

// Génère le lien de réinitialisation de mot de passe et l'envoie via Brevo.
export async function dispatchPasswordResetEmail(
  email: string,
  displayName?: string,
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${siteUrl()}/reset-password` },
    });

    if (error || !data.properties?.action_link) {
      console.error("[email:reset] generateLink", error?.message);
      return false;
    }

    await sendPasswordResetEmail(email, data.properties.action_link, displayName);
    return true;
  } catch (err) {
    console.error(
      "[email:reset]",
      err instanceof Error ? err.message : String(err),
    );
    return false;
  }
}
