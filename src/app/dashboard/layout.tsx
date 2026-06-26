import DashboardNav from "@/components/DashboardNav";
import FirstRunNavGuide from "@/components/FirstRunNavGuide";
import UserMenu from "@/components/UserMenu";
import { Logo } from "@/components/Logo";
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
      {/* Logo officiel — coin haut-gauche, symétrique de la pastille de compte
          (UserMenu, coin haut-droit). Même offset (left-4/top-3) et même marge
          de sécurité iOS pour un alignement visuel propre. */}
      <div
        className="fixed left-4 top-3 z-40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Logo size={24} />
      </div>
      {me && (
        <UserMenu
          name={me.display_name ?? ""}
          email={me.email}
          color={me.color}
          avatarUrl={me.avatar_url}
          isAdmin={me.role === "admin"}
        />
      )}
      {/* pt-16 réserve la hauteur de la barre logo/compte fixe ;
          pb-24 garde le dernier contenu au-dessus de la nav basse. */}
      <div className="mx-auto w-full max-w-[1200px] pb-24 pt-16">{children}</div>
      <DashboardNav />
      {/* Guide « première fois » des onglets (client). S'auto-gère : ne s'affiche
          qu'à la 1re visite (localStorage) et écoute l'évènement de rejeu. */}
      <FirstRunNavGuide />
    </div>
  );
}
