import DashboardNav from "@/components/DashboardNav";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase/server";

// Layout commun à toutes les pages du dashboard : applique le fond clair du
// design system, centre le contenu sur une largeur max de 1200px (DESIGN.md §4)
// et réserve l'espace bas pour la barre de navigation fixe.
// `pb-24` garantit que le dernier contenu n'est jamais masqué par la nav.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Profil pour la pastille de compte (en haut à droite). RLS : on ne lit que
  // le sien. Si absent (cas limite), on n'affiche simplement pas le menu.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = user
    ? await supabase
        .from("users")
        .select("display_name, email, role, color, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="min-h-screen bg-surface">
      {me && (
        <UserMenu
          name={me.display_name || ""}
          email={me.email}
          color={me.color}
          avatarUrl={me.avatar_url}
          isAdmin={me.role === "admin"}
        />
      )}
      <div className="mx-auto w-full max-w-[1200px] pb-24">{children}</div>
      <DashboardNav />
    </div>
  );
}
