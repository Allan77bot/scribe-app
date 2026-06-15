import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";

type Org = {
  name: string;
  plan: string;
  minutes_quota: number;
  minutes_used_this_period: number;
  onboarding_complete?: boolean;
};

type RawTask = { status?: string };

const MODULES = [
  { href: "/dashboard/capture", title: "Capturer", desc: "Vocal ou écrit" },
  { href: "/dashboard/tasks", title: "Tâches", desc: "Valider, suivre" },
  { href: "/dashboard/handover", title: "Passation", desc: "Relais d'équipe" },
  { href: "/dashboard/team", title: "Équipe", desc: "Membres & invitations" },
  { href: "/dashboard/report", title: "Rapport", desc: "Synthèse du soir" },
  { href: "/dashboard/billing", title: "Facturation", desc: "Plan & quotas" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Lecture profil + org.
  let { data: profile, error } = await supabase
    .from("users")
    .select("display_name, role, organizations(name, plan, minutes_quota, minutes_used_this_period)")
    .eq("id", user.id)
    .maybeSingle();

  // Auto-réparation : si le user existe dans auth.users sans profil public
  // (trigger handle_new_user manquant ou migrations non appliquées), on crée
  // le profil + l'org à la volée avec le client service_role.
  if (error || !profile) {
    const { createClient: createServiceClient } = await import("@/lib/supabase/service");
    const service = await createServiceClient();
    const orgName = user.email?.split("@")[0] ?? "Mon équipe";

    const { data: org } = await service
      .from("organizations")
      .insert({ name: orgName + " — équipe", plan: "free", minutes_quota: 600 })
      .select("id")
      .single();

    if (!org) {
      return (
        <main className="flex min-h-screen flex-1 items-center justify-center bg-ink-900 px-6 text-center text-cloud-50">
          <div className="w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-700 p-6">
            <h1 className="text-lg font-semibold">Profil introuvable</h1>
            <p className="mt-2 text-sm text-muted">
              Erreur lors de la création du profil. Réessaie ou contacte le support.
            </p>
            <form action={logout} className="mt-4">
              <button type="submit" className="min-h-[44px] w-full rounded-lg px-4 py-2.5 text-base font-medium text-cloud-50 transition-opacity hover:opacity-90" style={{ background: "var(--gradient-brand)" }}>
                Se déconnecter
              </button>
            </form>
          </div>
        </main>
      );
    }

    await service.from("users").insert({
      id: user.id,
      org_id: org.id,
      email: user.email,
      display_name: user.email?.split("@")[0] ?? "Membre",
      role: "admin",
    });

    // Re-query après création
    const result = await supabase
      .from("users")
      .select("display_name, role, organizations(name, plan, minutes_quota, minutes_used_this_period)")
      .eq("id", user.id)
      .maybeSingle();

    if (result.error || !result.data) {
      redirect("/login?message=profile-created");
    }
    profile = result.data;
    error = null;
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-ink-900 px-6 text-center text-cloud-50">
        <div className="w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-700 p-6">
          <h1 className="text-lg font-semibold">Profil introuvable</h1>
          <p className="mt-2 text-sm text-muted">
            Votre compte existe mais son profil d&apos;équipe n&apos;a pas pu être
            chargé. Déconnectez-vous puis reconnectez-vous.
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

  const org = (profile as unknown as { organizations?: Org }).organizations;

  // Météo des tâches — aggrégation depuis les entrées (RLS).
  const { data: entries } = await supabase
    .from("entries")
    .select("extracted_tasks_json");

  let toConfirm = 0;
  let active = 0;
  let done = 0;
  for (const e of entries ?? []) {
    const tasks = (e.extracted_tasks_json as RawTask[] | null) ?? [];
    for (const t of tasks) {
      const s = t.status ?? "proposed";
      if (s === "validated") active++;
      else if (s === "done") done++;
      else if (s === "rejected") continue;
      else toConfirm++;
    }
  }

  // Dernière passation (preview)
  const { data: handover } = await supabase
    .from("reports")
    .select("id, report_date, shift_label, created_at")
    .eq("kind", "handover")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Quota minutes réel
  const minutesQuota = org?.minutes_quota ?? 0;
  const minutesUsed = org?.minutes_used_this_period ?? 0;
  const minutesLeft = Math.max(minutesQuota - minutesUsed, 0);
  const usagePercent =
    minutesQuota > 0 ? Math.min((minutesUsed / minutesQuota) * 100, 100) : 0;

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-cloud-50">
      <header className="flex items-center justify-between border-b border-ink-600 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">
            {org?.name ?? "Mon équipe"}
          </p>
          <p className="truncate text-xs text-muted">
            {profile.display_name || user.email}
            {profile.role === "admin" ? " · admin" : ""}
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
        {/* Quick capture */}
        <Link
          href="/dashboard/capture"
          className="flex items-center justify-between rounded-2xl p-5 text-cloud-50 transition-opacity hover:opacity-95"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div className="min-w-0">
            <p className="text-base font-semibold">Capturer une note</p>
            <p className="mt-0.5 text-xs text-cloud-50/80">
              Vocal ou écrit — Scribe en extrait les tâches
            </p>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="2.5" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </Link>

        {/* Météo des tâches */}
        <Link href="/dashboard/tasks" className="mt-4 block">
          <section className="rounded-2xl bg-ink-700 p-5">
            <h2 className="mb-3 text-sm font-medium text-muted">Météo des tâches</h2>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div>
                <dt className="text-xs text-warning">À confirmer</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{toConfirm}</dd>
              </div>
              <div>
                <dt className="text-xs text-accent-blue">En cours</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{active}</dd>
              </div>
              <div>
                <dt className="text-xs text-success">Terminées</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{done}</dd>
              </div>
            </dl>
          </section>
        </Link>

        {/* Quota minutes */}
        <section className="mt-4 rounded-2xl bg-ink-700 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Minutes ce mois</h2>
            <span className="text-xs tabular-nums text-muted">
              <strong className="text-cloud-50">{minutesUsed}</strong> / {minutesQuota}
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink-600">
            <div
              className={`h-2.5 rounded-full transition-all ${
                usagePercent >= 90 ? "bg-danger" : usagePercent >= 75 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""} restante{minutesLeft !== 1 ? "s" : ""}
          </p>
        </section>

        {/* Aperçu passation */}
        <Link href="/dashboard/handover" className="mt-4 block">
          <section className="flex items-center justify-between rounded-2xl bg-ink-700 p-5">
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-muted">Dernière passation</h2>
              <p className="mt-1 text-sm font-semibold text-cloud-50">
                {handover
                  ? `${new Date(handover.report_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · ${handover.shift_label}`
                  : "Aucune passation générée"}
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-accent-cyan">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </section>
        </Link>

        {/* Modules */}
        <h2 className="mb-3 mt-7 text-sm font-medium text-muted">Tous les modules</h2>
        <div className="grid grid-cols-2 gap-3">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="rounded-2xl bg-ink-700 p-4 transition-opacity hover:opacity-90">
              <p className="text-sm font-semibold">{m.title}</p>
              <p className="mt-0.5 text-xs text-muted">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
