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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS garantit qu'on ne lit QUE son propre profil et sa propre org.
  const { data: profile } = await supabase
    .from("users")
    .select(
      "display_name, role, organizations(name, plan, minutes_quota, minutes_used_this_period, retention_days)",
    )
    .eq("id", user.id)
    .single();

  const org = profile?.organizations as unknown as Org | undefined;
  const minutesLeft = org
    ? Math.max(org.minutes_quota - org.minutes_used_this_period, 0)
    : 0;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">
            {org?.name ?? "Mon équipe"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {profile?.display_name || user.email}
            {profile?.role === "admin" ? " · admin" : ""}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-md px-5 py-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-medium text-slate-500">Ton organisation</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-slate-500">Plan</dt>
              <dd className="text-base font-semibold text-slate-900 capitalize">
                {org?.plan ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Minutes restantes</dt>
              <dd className="text-base font-semibold text-slate-900">
                {minutesLeft}
                <span className="text-sm font-normal text-slate-400">
                  {" "}
                  / {org?.minutes_quota ?? 0}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Rétention</dt>
              <dd className="text-base font-semibold text-slate-900">
                {org?.retention_days ?? 0} j
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Ton rôle</dt>
              <dd className="text-base font-semibold text-slate-900 capitalize">
                {profile?.role ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <p className="mt-6 text-center text-sm text-slate-400">
          Socle prêt. Prochaine étape : la capture vocale.
        </p>
      </main>
    </div>
  );
}
