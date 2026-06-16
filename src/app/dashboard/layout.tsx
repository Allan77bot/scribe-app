import DashboardNav from "@/components/DashboardNav";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnProfile } from "@/lib/user/profile";

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
  // le sien. Colonnes color/avatar_url (migration 0010) peuvent manquer.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lecture défensive : color/avatar_url peuvent manquer (migration 0010 non
  // appliquée). supabase-js renvoie `{error}` sans lever → le helper retombe sur
  // les colonnes garanties pour que la pastille de compte s'affiche toujours.
  const me = user ? await fetchOwnProfile(supabase, user.id) : null;

  return (
    <div className="min-h-screen bg-surface">
      {me && (
        <UserMenu
          name={me.display_name ?? ""}
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
