"use server";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Actions du wizard d'onboarding. Tout passe par la SESSION (RLS) : la policy
// org_update_own_admin garantit que seul un admin met à jour SA propre org —
// aucun bypass admin-client nécessaire (règle d'or n°2 respectée par construction).

async function orgIdForUser() {
  const session = await createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return { error: "Non authentifié" as const };

  const { data: profile } = await session
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return { error: "Organisation introuvable" as const };

  return { session, orgId: profile.org_id as string };
}

// Étape 1 — nommer l'organisation (créée avec un nom par défaut au signup).
export async function updateOrgName(
  name: string,
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Le nom ne peut pas être vide" };
  if (trimmed.length > 120) return { error: "Nom trop long (120 max)" };

  const ctx = await orgIdForUser();
  if ("error" in ctx) return { error: ctx.error };

  const { error } = await ctx.session
    .from("organizations")
    .update({ name: trimmed })
    .eq("id", ctx.orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

// Étape finale — marque l'onboarding comme terminé (le hub ne le réaffiche plus).
export async function completeOnboarding(): Promise<{ error?: string }> {
  const ctx = await orgIdForUser();
  if ("error" in ctx) return { error: ctx.error };

  const { error } = await ctx.session
    .from("organizations")
    .update({ onboarding_complete: true })
    .eq("id", ctx.orgId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}
