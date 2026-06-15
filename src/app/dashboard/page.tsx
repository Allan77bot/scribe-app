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
        <main className="flex min-h-screen flex-1 items-center justify-center bg-surface px-6 text-center text-on-surface">
          <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-card">
            <h1 className="text-lg font-semibold text-secondary">Profil introuvable</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Erreur lors de la création du profil. Réessaie ou contacte le support.
            </p>
            <form action={logout} className="mt-4">
              <button type="submit" className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]">
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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-surface px-6 text-center text-on-surface">
        <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-card">
          <h1 className="text-lg font-semibold text-secondary">Profil introuvable</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Votre compte existe mais son profil d&apos;équipe n&apos;a pas pu être
            chargé. Déconnectez-vous puis reconnectez-vous.
          </p>
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
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
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-secondary">
            {org?.name ?? "Mon équipe"}
          </p>
          <p className="truncate text-xs text-on-surface-variant">
            {profile.display_name || user.email}
            {profile.role === "admin" ? " · admin" : ""}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="shrink-0 rounded-pill bg-azure px-4 py-2 text-sm font-medium text-primary transition-all hover:brightness-95"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      <div className="mx-auto w-full max-w-md px-5 py-6">
        {/* Quick capture */}
        <Link
          href="/dashboard/capture"
          className="flex items-center justify-between rounded-card bg-primary p-5 text-on-primary shadow-card transition-all hover:bg-primary-container active:scale-[0.98]"
        >
          <div className="min-w-0">
            <p className="text-base font-semibold">Capturer une note</p>
            <p className="mt-0.5 text-xs text-on-primary/80">
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
          <section className="rounded-card bg-white p-6 shadow-card">
            <h2 className="mb-3 text-sm font-medium text-secondary">Météo des tâches</h2>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div>
                <dt className="text-xs text-on-surface-variant">À confirmer</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-secondary">{toConfirm}</dd>
              </div>
              <div>
                <dt className="text-xs text-on-surface-variant">En cours</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-primary">{active}</dd>
              </div>
              <div>
                <dt className="text-xs text-on-surface-variant">Terminées</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-on-surface">{done}</dd>
              </div>
            </dl>
          </section>
        </Link>

        {/* Quota minutes */}
        <section className="mt-4 rounded-card bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary">Minutes ce mois</h2>
            <span className="text-xs tabular-nums text-on-surface-variant">
              <strong className="text-on-surface">{minutesUsed}</strong> / {minutesQuota}
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-pill bg-surface-container">
            <div
              className={`h-2.5 rounded-pill transition-all ${
                usagePercent >= 90 ? "bg-error" : usagePercent >= 75 ? "bg-secondary" : "bg-primary"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-on-surface-variant">
            {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""} restante{minutesLeft !== 1 ? "s" : ""}
          </p>
        </section>

        {/* Aperçu passation */}
        <Link href="/dashboard/handover" className="mt-4 block">
          <section className="flex items-center justify-between rounded-card bg-white p-6 shadow-card">
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-secondary">Dernière passation</h2>
              <p className="mt-1 text-sm font-semibold text-on-surface">
                {handover
                  ? `${new Date(handover.report_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · ${handover.shift_label}`
                  : "Aucune passation générée"}
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-primary">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </section>
        </Link>

        {/* Modules */}
        <h2 className="mb-3 mt-7 text-sm font-medium text-secondary">Tous les modules</h2>
        <div className="grid grid-cols-2 gap-3">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="rounded-card bg-white p-6 shadow-card transition-all hover:brightness-95 active:scale-[0.98]">
              <p className="text-sm font-semibold text-secondary">{m.title}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
