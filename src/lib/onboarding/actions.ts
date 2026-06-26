"use server";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidMemberColor } from "@/lib/avatar";
import {
  inviteOne,
  loadInviteContext,
  type InviteStatus,
} from "@/lib/invitations/service";

// Actions du wizard d'onboarding. Tout passe par la SESSION (RLS) : les policies
// org_update_own_admin (org) et users_update_self (profil) garantissent qu'un
// utilisateur ne touche que SA propre org / SON propre profil — aucun bypass
// admin-client nécessaire (règle d'or n°2 respectée par construction).

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

// Étape 1 (manager) — nommer l'organisation (créée avec un nom par défaut au signup).
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

// Étape profil (employé invité) — enregistre nom affiché + couleur. À la
// différence de lib/user/actions.ts:updateProfile, cette action RETOURNE un
// résultat (ne redirige PAS) : c'est le wizard qui pilote la navigation.
// Validation identique : nom 1–80, couleur dans la palette fermée (isValidMemberColor)
// ET libre dans l'org (deux membres ne partagent jamais la même teinte — FEATURE 2).
// La RLS (users_select_same_org) restreint la lecture des couleurs à NOTRE org.
export async function saveOnboardingProfile(
  name: string,
  color: string,
): Promise<{ error?: string }> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const displayName = name.trim();
  if (displayName.length < 1 || displayName.length > 80) {
    return { error: "Le nom doit faire entre 1 et 80 caractères." };
  }

  const patch: { display_name: string; color?: string } = {
    display_name: displayName,
  };

  const trimmedColor = color.trim();
  if (trimmedColor) {
    if (!isValidMemberColor(trimmedColor)) {
      return { error: "Couleur invalide." };
    }

    // Couleur courante (RLS : on ne lit que son propre profil).
    const { data: me } = await supabase
      .from("users")
      .select("color")
      .eq("id", user.id)
      .single();

    if (me?.color !== trimmedColor) {
      // La couleur doit être libre dans l'org (hors la mienne).
      const { data: taken } = await supabase
        .from("users")
        .select("id")
        .eq("color", trimmedColor)
        .neq("id", user.id)
        .limit(1);

      if (taken && taken.length > 0) {
        return { error: "Cette couleur est déjà prise dans l'équipe." };
      }
    }
    patch.color = trimmedColor;
  }

  const { error } = await supabase.from("users").update(patch).eq("id", user.id);

  if (error) {
    console.error("[onboarding:saveOnboardingProfile]", error.message);
    return { error: "La mise à jour a échoué. Réessayez." };
  }

  revalidatePath("/dashboard", "layout");
  return {};
}

// Étape invitation (manager) — envoie un lot d'invitations. ADMIN ONLY :
// loadInviteContext vérifie le rôle ; un non-admin ne déclenche AUCUNE invitation
// (renvoyées en statut "error"). Isolation org stricte : inviteOne écrit par la
// SESSION (RLS), org_id = current_org_id() — aucune fuite cross-org possible.
// Les champs vides sont ignorés (l'UI ajoute des champs e-mail dynamiques).
export async function sendOnboardingInvites(
  emails: string[],
): Promise<{ results: Array<{ email: string; status: InviteStatus }> }> {
  const supabase = await createSessionClient();

  const loaded = await loadInviteContext(supabase);
  if ("error" in loaded) {
    // Non authentifié ou non-admin : on n'émet rien et on signale l'échec par
    // e-mail non vide (le client garde le détail par adresse).
    const reported = emails.map((e) => e.trim()).filter(Boolean);
    return {
      results: reported.map((email) => ({ email, status: "error" as const })),
    };
  }

  // Déduplication (insensible à la casse) : une même adresse saisie deux fois ne
  // doit pas être comptée deux fois (sinon « 2 invitations » pour 1 personne).
  const seen = new Set<string>();
  const results: Array<{ email: string; status: InviteStatus }> = [];
  for (const raw of emails) {
    const trimmed = raw.trim();
    if (!trimmed) continue; // champ e-mail laissé vide → ignoré
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue; // doublon dans le lot → ignoré
    seen.add(key);
    const r = await inviteOne(supabase, loaded.ctx, trimmed);
    results.push({ email: r.email, status: r.status });
  }

  revalidatePath("/dashboard");
  return { results };
}

// Étape finale — marque l'onboarding de CE membre comme terminé (le hub ne le
// réaffiche plus). Par-personne depuis 0014 (users.onboarding_complete), plus sur
// l'org : un employé invité a son propre parcours. Policy users_update_self.
export async function completeOnboarding(): Promise<{ error?: string }> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase
    .from("users")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  if (error) {
    // Message générique au client (cohérent avec les autres actions) ; le détail
    // technique reste dans les logs serveur.
    console.error("[onboarding:completeOnboarding]", error.message);
    return { error: "La validation a échoué. Réessayez." };
  }
  revalidatePath("/dashboard");
  return {};
}
