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
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-lg font-semibold text-slate-900">
            Profil introuvable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
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
    <main
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#0A0708", color: "#F0E8D6" }}
    >
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Facturation</h1>
          <p className="mt-1 text-xs" style={{ color: "#A8804D" }}>
            Gestion de votre abonnement et quotas
          </p>
        </header>

        {/* Messages d'état URL */}
        {showSuccess && (
          <div className="mb-6 rounded-lg bg-green-900/20 border border-green-700 p-4">
            <p className="text-sm text-green-300">
              ✅ Paiement effectué avec succès ! Votre abonnement est maintenant actif.
            </p>
          </div>
        )}

        {showCanceled && (
          <div className="mb-6 rounded-lg bg-yellow-900/20 border border-yellow-700 p-4">
            <p className="text-sm text-yellow-300">
              ⚠️ Paiement annulé. Vous pouvez essayer à nouveau quand vous le souhaitez.
            </p>
          </div>
        )}

        {/* Informations actuelles */}
        <section className="mb-6 rounded-2xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-sm font-medium" style={{ color: "#A8804D" }}>Plan actuel</h2>

          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold capitalize">{org.plan}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  org.subscription_status === "active"
                    ? "bg-green-900/30 text-green-300 border border-green-700/50"
                    : org.subscription_status === "trial"
                    ? "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                    : "bg-red-900/30 text-red-300 border border-red-700/50"
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
              <div className="rounded-lg bg-blue-900/20 border border-blue-700/50 p-3">
                <p className="text-sm text-blue-300">
                  ⏱️ <strong>{trialDaysLeft} jour{trialDaysLeft !== 1 ? "s" : ""} restant{trialDaysLeft !== 1 ? "s" : ""}</strong> dans votre période d&apos;essai
                </p>
              </div>
            )}

            {/* Message fin d'abonnement */}
            {org.subscription_status === "canceled" && (
              <div className="rounded-lg bg-red-900/20 border border-red-700/50 p-3">
                <p className="text-sm text-red-300">
                  🚨 Votre abonnement a été annulé. Souscrivez à nouveau pour continuer à utiliser Scribe.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quotas et usage */}
        <section className="mb-6 rounded-2xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-sm font-medium" style={{ color: "#A8804D" }}>Usage ce mois</h2>

          <div className="mt-3 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Minutes utilisées</span>
                <span><strong>{minutesUsed}</strong> / {minutesQuota}</span>
              </div>

              {/* Barre de progression */}
              <div className="mt-2 w-full bg-white/10 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    usagePercent >= 90 ? "bg-red-500" :
                    usagePercent >= 75 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>

              <p className="mt-1 text-xs" style={{ color: "#A8804D" }}>
                {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""} restante{minutesLeft !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Boutons d'upgrade — seulement si admin et s'il reste des paliers supérieurs */}
        {profile.role === "admin" && upgradePlans.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium" style={{ color: "#A8804D" }}>Changer de plan</h2>

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
          <section className="rounded-2xl bg-white/5 p-5 border border-white/10">
            <p className="text-sm" style={{ color: "#A8804D" }}>
              💡 Seuls les administrateurs peuvent modifier le plan de facturation.
            </p>
          </section>
        )}

        <p
          className="mt-10 text-center text-xs font-mono"
          style={{ color: "#6E1F2C" }}
        >
          PHASE 5 DONE
        </p>
      </div>
    </main>
  );
}