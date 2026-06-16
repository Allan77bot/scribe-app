"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidMemberColor } from "@/lib/avatar";

// Mise à jour du profil (nom affiché + couleur). Écriture par SESSION : la
// policy users_update_self limite à son propre profil — pas besoin de service_role.
// La couleur est validée côté serveur (palette fermée) ET vérifiée libre dans
// l'org (deux membres ne partagent jamais la même teinte — FEATURE 2).
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName = String(formData.get("display_name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (displayName.length < 1 || displayName.length > 80) {
    redirect(
      "/dashboard/settings?error=" +
        encodeURIComponent("Le nom doit faire entre 1 et 80 caractères."),
    );
  }

  const patch: { display_name: string; color?: string } = {
    display_name: displayName,
  };

  if (color) {
    if (!isValidMemberColor(color)) {
      redirect(
        "/dashboard/settings?error=" +
          encodeURIComponent("Couleur invalide."),
      );
    }

    // org_id du profil courant (RLS : on ne lit que le sien).
    const { data: me } = await supabase
      .from("users")
      .select("org_id, color")
      .eq("id", user.id)
      .single();

    if (me?.color !== color) {
      // La couleur doit être libre dans l'org (hors la mienne).
      const { data: taken } = await supabase
        .from("users")
        .select("id")
        .eq("color", color)
        .neq("id", user.id)
        .limit(1);

      if (taken && taken.length > 0) {
        redirect(
          "/dashboard/settings?error=" +
            encodeURIComponent("Cette couleur est déjà prise dans l'équipe."),
        );
      }
    }
    patch.color = color;
  }

  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", user.id);

  if (error) {
    console.error("[user:updateProfile]", error.message);
    redirect(
      "/dashboard/settings?error=" +
        encodeURIComponent("La mise à jour a échoué. Réessaie."),
    );
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/settings?saved=1");
}
