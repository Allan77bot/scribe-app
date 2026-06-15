import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";

type Org = {
  name: string;
  plan: string;
  minutes_quota: number;
  minutes_used_this_period: number;
  retention_days: number;
};

// Raccourcis vers les modules. L'accueil devient le hub qui les relie tous
// (la navigation basse reste disponible partout via le layout).
const MODULES = [
  {
    href: "/dashboard/capture",
    title: "Capturer une note",
    desc: "Vocal ou écrit → tâches extraites",
  },
  {
    href: "/dashboard/tasks",
    title: "Tâches",
    desc: "Suivi, validation, assignation",
  },
  {
    href: "/dashboard/report",
    title: "Rapport du soir",
    desc: "Passation + accusés de lecture",
  },
  {
    href: "/dashboard/billing",
    title: "Facturation",
    desc: "Plan, quotas, abonnement",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS garantit qu'on ne lit QUE son propre profil et sa propre org.
  const { data: profile, error } = await supabase
    .from("users")
    .select(
      "display_name, role, organizations(name, plan, minutes_quota, minutes_used_this_period, retention_days)",
    )
    .eq("id", user.id)
    .maybeSingle();

  // État incohérent rare : le compte auth existe mais pas le profil applicatif.
  // On affiche un message clair + déconnexion (pas de redirect : éviterait une
  // boucle avec le proxy qui renvoie les connectés hors de /login).
  if (error || !profile) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-ink-900 px-6 text-center text-cloud-50">
        <div className="w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-700 p-6">
          <h1 className="text-lg font-semibold">Profil introuvable</h1>
          <p className="mt-2 text-sm text-muted">
            Ton compte existe mais son profil d&apos;équipe n&apos;a pas pu être
            chargé. Déconnecte-toi puis reconnecte-toi. Si ça persiste, contacte
            le support.
          </p>
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-lg px-4 py-2.5 text-base font-medium text-cloud-50 transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </main>
    );
  }

  // TODO: remplacer ce cast par les types générés (supabase gen types typescript)
  // une fois la base en ligne — la relation to-one est typée objet à l'exécution.
  const org = profile.organizations as unknown as Org | undefined;
  const minutesLeft = org
    ? Math.max(org.minutes_quota - org.minutes_used_this_period, 0)
    : 0;

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-cloud-50">
      <header className="flex items-center justify-between border-b border-ink-600 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">
            {org?.name ?? "Mon équipe"}
          </p>
          <p className="truncate text-xs text-muted">
            {profile?.display_name || user.email}
            {profile?.role === "admin" ? " · admin" : ""}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-ink-600 px-3 py-1.5 text-sm font-medium text-cloud-50 transition-colors hover:border-accent-cyan"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      <div className="mx-auto w-full max-w-md px-5 py-6">
        {/* Synthèse organisation */}
        <section className="rounded-2xl bg-ink-700 p-5">
          <h2 className="text-sm font-medium text-muted">Ton organisation</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted">Plan</dt>
              <dd className="text-base font-semibold capitalize">
                {org?.plan ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Minutes restantes</dt>
              <dd className="text-base font-semibold">
                {minutesLeft}
                <span className="text-sm font-normal text-hint">
                  {" "}
                  / {org?.minutes_quota ?? 0}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Rétention</dt>
              <dd className="text-base font-semibold">
                {org?.retention_days ?? 0} j
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Ton rôle</dt>
              <dd className="text-base font-semibold capitalize">
                {profile?.role ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Accès rapide aux modules */}
        <h2 className="mt-7 mb-3 text-sm font-medium text-muted">
          Que veux-tu faire ?
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center justify-between rounded-2xl bg-ink-700 p-4 transition-opacity hover:opacity-90"
            >
              <div className="min-w-0">
                <p className="text-base font-semibold">{m.title}</p>
                <p className="mt-0.5 text-xs text-muted">{m.desc}</p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 text-accent-cyan"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
