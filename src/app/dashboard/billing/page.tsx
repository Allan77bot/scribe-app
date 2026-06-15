import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpgradeButton from "@/components/UpgradeButton";

type Org = {
  id: string;
  name: string;
  plan: string;
  subscription_status: string;
  minutes_quota: number;
  minutes_used_this_period: number;
  created_at: string;
};

// Hiérarchie des plans : on ne propose QUE les paliers supérieurs au plan courant.
const PLAN_HIERARCHY = ["trial", "solo", "team", "business"];

// Catalogue des plans payants (ordre croissant).
const PAID_PLANS = [
  { plan: "solo", name: "Solo", price: "9€/mois" },
  { plan: "team", name: "Team", price: "29€/mois" },
  { plan: "business", name: "Business", price: "99€/mois" },
];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS garantit qu'on ne lit QUE son propre profil et sa propre org.
  const { data: profile, error } = await supabase
    .from("users")
    .select(
      "display_name, role, organizations(id, name, plan, subscription_status, minutes_quota, minutes_used_this_period, created_at)",
    )
    .eq("id", user.id)
    .maybeSingle();

  // État incohérent rare : le compte auth existe mais pas le profil applicatif.
  if (error || !profile) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-ink-900 px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-700 p-6">
          <h1 className="text-lg font-semibold text-cloud-50">
            Profil introuvable
          </h1>
          <p className="mt-2 text-sm text-muted">
            Impossible de charger les informations de facturation.
          </p>
        </div>
      </main>
    );
  }

  const org = profile.organizations as unknown as Org;
  const minutesUsed = org.minutes_used_this_period || 0;
  const minutesQuota = org.minutes_quota || 0;
  const minutesLeft = Math.max(minutesQuota - minutesUsed, 0);
  const usagePercent = minutesQuota > 0 ? Math.min((minutesUsed / minutesQuota) * 100, 100) : 0;

  // Calcul des jours restants pour le trial (30 jours depuis created_at)
  const trialDaysLeft = (() => {
    if (org.plan !== "trial") return null;
    const createdAt = new Date(org.created_at);
    const trialEndDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    return daysLeft;
  })();

  // Gestion des messages d'état (searchParams est une Promise en Next 16).
  const { success, canceled } = await searchParams;
  const showSuccess = Boolean(success);
  const showCanceled = Boolean(canceled);

  // Plans proposables : strictement au-dessus du plan courant.
  const currentIndex = PLAN_HIERARCHY.indexOf(org.plan);
  const upgradePlans = PAID_PLANS.filter(
    (p) => PLAN_HIERARCHY.indexOf(p.plan) > currentIndex,
  );

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-cloud-50">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Facturation</h1>
          <p className="mt-1 text-xs text-muted">
            Gestion de votre abonnement et quotas
          </p>
        </header>

        {/* Messages d'état URL */}
        {showSuccess && (
          <div className="mb-6 rounded-lg border border-success/40 bg-success/10 p-4">
            <p className="text-sm text-success">
              Paiement effectué. Votre abonnement est maintenant actif.
            </p>
          </div>
        )}

        {showCanceled && (
          <div className="mb-6 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <p className="text-sm text-warning">
              Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
            </p>
          </div>
        )}

        {/* Informations actuelles */}
        <section className="mb-6 rounded-2xl border border-ink-600 bg-ink-700 p-5">
          <h2 className="text-sm font-medium text-muted">Plan actuel</h2>

          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold capitalize">{org.plan}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  org.subscription_status === "active"
                    ? "bg-success/15 text-success border-success/40"
                    : org.subscription_status === "trial"
                    ? "bg-accent-blue/15 text-accent-blue border-accent-blue/40"
                    : "bg-danger/15 text-danger border-danger/40"
                }`}
              >
                {org.subscription_status === "trial" ? "Essai" :
                 org.subscription_status === "active" ? "Actif" :
                 org.subscription_status === "canceled" ? "Annulé" :
                 org.subscription_status === "past_due" ? "En retard" :
                 org.subscription_status}
              </span>
            </div>

            {/* Compteur trial */}
            {org.plan === "trial" && trialDaysLeft !== null && (
              <div className="rounded-lg border border-accent-blue/40 bg-accent-blue/10 p-3">
                <p className="text-sm text-accent-blue">
                  <strong>{trialDaysLeft} jour{trialDaysLeft !== 1 ? "s" : ""} restant{trialDaysLeft !== 1 ? "s" : ""}</strong> dans votre période d&apos;essai
                </p>
              </div>
            )}

            {/* Message fin d'abonnement */}
            {org.subscription_status === "canceled" && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 p-3">
                <p className="text-sm text-danger">
                  Votre abonnement a été annulé. Souscrivez à nouveau pour continuer à utiliser Scribe.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quotas et usage */}
        <section className="mb-6 rounded-2xl border border-ink-600 bg-ink-700 p-5">
          <h2 className="text-sm font-medium text-muted">Usage ce mois</h2>

          <div className="mt-3 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Minutes utilisées</span>
                <span><strong>{minutesUsed}</strong> / {minutesQuota}</span>
              </div>

              {/* Barre de progression */}
              <div className="mt-2 h-2.5 w-full rounded-full bg-ink-600">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    usagePercent >= 90 ? "bg-danger" :
                    usagePercent >= 75 ? "bg-warning" : "bg-success"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-muted">
                {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""} restante{minutesLeft !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Boutons d'upgrade — seulement si admin et s'il reste des paliers supérieurs */}
        {profile.role === "admin" && upgradePlans.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted">Changer de plan</h2>

            {upgradePlans.map((p) => (
              <UpgradeButton
                key={p.plan}
                targetPlan={p.plan}
                targetPlanName={p.name}
                price={p.price}
              />
            ))}
          </section>
        )}

        {/* Message pour non-admin */}
        {profile.role !== "admin" && (
          <section className="rounded-2xl border border-ink-600 bg-ink-700 p-5">
            <p className="text-sm text-muted">
              Seuls les administrateurs peuvent modifier le plan de facturation.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}