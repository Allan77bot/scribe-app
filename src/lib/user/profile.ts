import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Lecture défensive des profils — tolère l'absence des colonnes color/avatar_url
// (migration 0010 non encore appliquée en prod). supabase-js NE LÈVE PAS sur une
// colonne inconnue : il renvoie `{ data: null, error }`. Un try/catch autour d'un
// `await select` est donc du code mort ; on doit inspecter `error` et retomber
// sur les colonnes garanties. Sans ce repli, la page Réglages renvoyait `me`
// null → redirection vers l'accueil (« clic profil → accueil »).

export type SafeProfile = {
  id: string;
  display_name: string | null;
  email: string;
  role: string;
  org_id?: string;
  color: string | null;
  avatar_url: string | null;
};

// Profil de l'utilisateur courant. `extra` ajoute des colonnes garanties
// supplémentaires (ex. "org_id"). color/avatar_url sont null si absentes.
export async function fetchOwnProfile(
  supabase: SupabaseClient,
  userId: string,
  extra = "",
): Promise<SafeProfile | null> {
  const base = "id, display_name, email, role" + (extra ? ", " + extra : "");
  const full = base + ", color, avatar_url";

  const res = await supabase.from("users").select(full).eq("id", userId).maybeSingle();
  if (!res.error) {
    return (res.data as SafeProfile | null) ?? null;
  }

  // Colonnes color/avatar_url absentes → repli sur les colonnes de base.
  const fb = await supabase.from("users").select(base).eq("id", userId).maybeSingle();
  if (fb.error || !fb.data) return null;
  return {
    ...(fb.data as unknown as Omit<SafeProfile, "color" | "avatar_url">),
    color: null,
    avatar_url: null,
  };
}

// Liste des membres de l'org courante (RLS). Même repli défensif que ci-dessus.
export async function fetchOrgMembers(supabase: SupabaseClient): Promise<SafeProfile[]> {
  const base = "id, display_name, email, role";
  const full = base + ", color, avatar_url";

  const res = await supabase
    .from("users")
    .select(full)
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });
  if (!res.error) {
    return (res.data as unknown as SafeProfile[] | null) ?? [];
  }

  const fb = await supabase
    .from("users")
    .select(base)
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });
  if (fb.error || !fb.data) return [];
  return (fb.data as unknown as Omit<SafeProfile, "color" | "avatar_url">[]).map((m) => ({
    ...m,
    color: null,
    avatar_url: null,
  }));
}
