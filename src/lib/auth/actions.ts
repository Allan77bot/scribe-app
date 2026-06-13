"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ── Inscription ──────────────────────────────────────────────────────────
// Crée le compte Supabase. Le trigger SQL handle_new_user() crée alors l'org
// (à partir de org_name) et le profil utilisateur en rôle 'admin'.
export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("org_name") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || !password || !orgName) {
    redirect("/signup?error=" + encodeURIComponent("Tous les champs sont requis."));
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
          "La création du compte a échoué. Vérifie tes informations, ou connecte-toi si tu as déjà un compte.",
        ),
    );
  }

  // Pas de session = confirmation e-mail requise → on invite à confirmer.
  if (!data.session) {
    redirect("/login?message=confirm-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/capture");
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
  redirect("/dashboard/capture");
}

// ── Déconnexion ──────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
