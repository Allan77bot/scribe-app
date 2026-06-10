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
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  // Pas de session = confirmation e-mail requise → on invite à confirmer.
  if (!data.session) {
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
    redirect("/login?error=" + encodeURIComponent(error.message));
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
