import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { updateProfile } from "@/lib/user/actions";
import AvatarUpload from "@/components/AvatarUpload";
import ColorPicker from "@/components/ColorPicker";

// Réglages du compte : photo, nom affiché, couleur distinctive. Lecture par
// SESSION (RLS). La photo s'envoie immédiatement ; nom + couleur via le bouton.

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("users")
    .select("display_name, email, role, color, avatar_url, org_id")
    .eq("id", user.id)
    .single();
  if (!me) redirect("/dashboard?error=no-profile");

  const isAdmin = me.role === "admin";

  // Couleurs déjà prises par les AUTRES membres (RLS : même org seulement).
  const { data: others } = await supabase
    .from("users")
    .select("color")
    .neq("id", user.id);
  const taken = (others ?? [])
    .map((u) => u.color)
    .filter((c): c is string => Boolean(c));

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <header className="px-5 pt-8">
        <h1 className="text-xl font-semibold text-secondary">Réglages</h1>
        <p className="mt-1 text-xs text-on-surface-variant">
          Ton identité dans l&apos;équipe — photo, nom et couleur.
        </p>
      </header>

      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-6">
        {saved && (
          <p className="mb-4 rounded-field bg-azure px-4 py-3 text-sm font-medium text-primary">
            Réglages enregistrés.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-field bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </p>
        )}

        <div className="rounded-card bg-white p-6 shadow-card">
          <AvatarUpload
            name={me.display_name || ""}
            email={me.email}
            color={me.color}
            avatarUrl={me.avatar_url}
            isAdmin={isAdmin}
          />

          <form action={updateProfile} className="mt-6 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Nom affiché
              </span>
              <input
                type="text"
                name="display_name"
                defaultValue={me.display_name || ""}
                required
                maxLength={80}
                placeholder="Ton prénom"
                className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Ta couleur
              </span>
              <p className="text-xs text-on-surface-variant">
                Elle t&apos;identifie partout — tâches, passation, équipe. Une
                couleur par personne.
              </p>
              <div className="mt-1">
                <ColorPicker current={me.color} taken={taken} />
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              Enregistrer
            </button>
          </form>
        </div>

        {/* Compte — e-mail en lecture seule + déconnexion. */}
        <div className="mt-4 rounded-card bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Compte
          </p>
          <p className="mt-1 truncate text-sm text-on-surface">{me.email}</p>
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-pill bg-azure px-6 text-sm font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
