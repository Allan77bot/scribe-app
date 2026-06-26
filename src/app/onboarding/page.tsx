import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnProfile } from "@/lib/user/profile";
import OnboardingWizard from "@/components/OnboardingWizard";

// Routing de l'onboarding par-personne (migration 0014). Charge le profil courant
// (rôle, nom, couleur, org) + le nom de l'org + l'inviteur (pour l'écran employé),
// puis passe le tout au wizard. Tout par la SESSION (RLS) : isolation org garantie.
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Déjà terminé → on ne réimpose pas le wizard. Lecture DÉFENSIVE : si la colonne
  // onboarding_complete est absente (0014 pas appliquée), on NE redirige PAS et on
  // montre le wizard (pas de blocage sur un schéma pas à jour).
  const completeRes = await supabase
    .from("users")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();
  if (!completeRes.error && completeRes.data?.onboarding_complete === true) {
    redirect("/dashboard");
  }

  const me = await fetchOwnProfile(supabase, user.id, "org_id");
  if (!me) redirect("/dashboard?error=no-profile");

  // Nom de l'org (RLS : la nôtre uniquement).
  const { data: orgRow } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", me.org_id ?? "")
    .maybeSingle();
  const orgName = orgRow?.name ?? "votre équipe";

  // Inviteur (parcours employé) : un admin de l'org, le plus ancien. La RLS
  // (users_select_same_org) restreint déjà cette lecture à NOTRE org.
  let inviterName: string | null = null;
  if (me.role !== "admin") {
    const { data: admins } = await supabase
      .from("users")
      .select("display_name")
      .eq("role", "admin")
      .order("created_at", { ascending: true })
      .limit(1);
    inviterName = admins?.[0]?.display_name ?? null;
  }

  // Couleurs déjà prises par les autres membres (parcours employé) : on les grise
  // dans le ColorPicker pour éviter une collision découverte seulement au submit.
  // Lecture DÉFENSIVE (colonne color absente avant 0010 → []). RLS
  // users_select_same_org : restreinte à NOTRE org.
  let takenColors: string[] = [];
  if (me.role !== "admin") {
    const membersRes = await supabase
      .from("users")
      .select("color")
      .neq("id", user.id);
    if (!membersRes.error) {
      takenColors = (membersRes.data ?? [])
        .map((m) => (m as { color: string | null }).color)
        .filter((c): c is string => Boolean(c));
    }
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-6">
        <OnboardingWizard
          role={me.role === "admin" ? "admin" : "member"}
          initialOrgName={orgName}
          orgName={orgName}
          inviterName={inviterName}
          displayName={me.display_name ?? ""}
          initialColor={me.color}
          takenColors={takenColors}
        />
      </div>
    </main>
  );
}
