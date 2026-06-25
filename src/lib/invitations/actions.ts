"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dispatchVerificationEmail } from "@/lib/email/auth-links";
import { getValidInvitationByToken, normalizeEmail } from "./service";

// ── Acceptation d'une invitation ───────────────────────────────────────────
// L'invité s'inscrit ; le trigger SQL handle_new_user() lit invitation_token
// dans les métadonnées, revérifie le jeton (pending + non expiré + e-mail
// identique) et rattache l'utilisateur à l'org du jeton en rôle 'member' —
// jamais via un org_id brut (règle d'or n°2).
export async function acceptInvitation(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  const fail = (msg: string) =>
    redirect(`/invite/accept?token=${token}&error=${encodeURIComponent(msg)}`);

  if (!token) redirect("/invite/accept?error=" + encodeURIComponent("Lien invalide."));
  if (!password || password.length < 8) {
    fail("Choisissez un mot de passe d'au moins 8 caractères.");
  }

  // Défense en profondeur : on revalide le jeton côté serveur avant le signUp
  // (le trigger le revalide une 3e fois). L'e-mail vient de l'invitation, jamais
  // du formulaire → impossible de détourner l'invitation vers une autre adresse.
  const invite = await getValidInvitationByToken(token);
  if (!invite) {
    fail("Cette invitation n'est plus valide. Demandez un nouveau lien.");
    return;
  }

  const email = normalizeEmail(invite.email);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lu par le trigger SQL handle_new_user() pour le rattachement à l'org.
      data: { display_name: displayName, invitation_token: token },
    },
  });

  if (error) {
    console.error("[invite:accept]", error.message);
    fail("La création du compte a échoué. Réessayez, ou connectez-vous si vous avez déjà un compte.");
    return;
  }

  // Pas de session = confirmation e-mail requise. On délivre le lien via Brevo,
  // comme à l'inscription normale. Le compte (et le rattachement à l'org) existe déjà.
  if (!data.session) {
    await dispatchVerificationEmail(email, password, displayName || undefined);
    redirect("/login?message=confirm-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ── Révocation d'une invitation en attente (admin) ──────────────────────────
// Passe par la SESSION (RLS) : la policy invitations_update_admin garantit que
// seul un admin de l'org révoque une invitation de SA propre org.
export async function revokeInvitation(
  invitationId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (error) return { error: "La révocation a échoué." };
  revalidatePath("/dashboard/team");
  return {};
}
