"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dispatchVerificationEmail } from "@/lib/email/auth-links";
import { cleanLine } from "@/lib/sanitize";

// ── Inscription ──────────────────────────────────────────────────────────
// Crée le compte Supabase. Le trigger SQL handle_new_user() crée alors l'org
// (à partir de org_name) et le profil utilisateur en rôle 'admin'.
export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // FAILLE AS-13 : valeurs « une ligne » bornées + nettoyées côté serveur (la
  // validation HTML est contournable) — anti-injection e-mail/UI et cohérence.
  const orgName = cleanLine(String(formData.get("org_name") ?? ""), 120);
  const displayName = cleanLine(String(formData.get("display_name") ?? ""), 80);

  if (!email || !password || !orgName) {
    redirect("/signup?error=" + encodeURIComponent("Tous les champs sont requis."));
  }

  // FAILLE AS-11 : la longueur du mot de passe n'était imposée que par l'attribut
  // HTML minlength (contournable par POST direct). On la revalide côté serveur.
  if (password.length < 8) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Le mot de passe doit faire au moins 8 caractères."),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lu par le trigger SQL handle_new_user().
      data: { org_name: orgName, display_name: displayName },
    },
  });

  if (error) {
    // Vrai message loggé côté serveur ; message générique côté client pour ne
    // pas révéler si l'e-mail existe déjà (anti-énumération de comptes).
    console.error("[auth:signup]", error.message);
    redirect(
      "/signup?error=" +
        encodeURIComponent(
          "La création du compte a échoué. Vérifiez vos informations, ou connectez-vous si vous avez déjà un compte.",
        ),
    );
  }

  // Pas de session = confirmation e-mail requise. On délivre nous-mêmes l'e-mail
  // de vérification via Brevo (pas le SMTP intégré de Supabase). Un échec d'envoi
  // ne bloque pas l'inscription : le compte existe, l'e-mail est renvoyable
  // depuis l'écran de connexion (POST /api/auth/confirm).
  if (!data.session) {
    await dispatchVerificationEmail(email, password, displayName || undefined);
    redirect("/login?message=confirm-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ── Connexion ────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Message générique : ne pas distinguer « e-mail inconnu » de « mauvais mot
    // de passe » (anti-énumération). Vrai message loggé côté serveur.
    console.error("[auth:login]", error.message);
    redirect(
      "/login?error=" + encodeURIComponent("E-mail ou mot de passe incorrect."),
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ── Déconnexion ──────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
