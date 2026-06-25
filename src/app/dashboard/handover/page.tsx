import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import ReportCard, { type Report, type ReportRead } from "@/components/ReportCard";
import GenerateHandoverButton from "@/components/GenerateHandoverButton";

function adminClient() {
  try {
    return createAdminSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  } catch {
    return null;
  }
}

// Page de passation 3×8 : « ce qu'il faut savoir depuis le dernier passage ».
// Réutilise la table reports (kind='handover') et l'infra d'accusés de lecture.
export default async function HandoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) redirect("/dashboard?error=no-org");

  // L'agrégation de passation passe par le client admin (service_role) pour
  // recouper reports + report_reads + users. Si la clé service_role est absente
  // ou tronquée (env mal configuré), on n'expose JAMAIS une erreur 500 brute :
  // on rend une carte propre et explicite. Tout le bloc admin est isolé.
  let report: Report | null = null;
  let reads: ReportRead[] = [];
  let memberCount: number | undefined;
  let adminUnavailable = false;

  try {
    const admin = adminClient();
    if (!admin) {
      adminUnavailable = true;
      throw new Error("Client admin indisponible (clé service_role absente ou tronquée).");
    }

    // Dernière passation de l'org — admin client filtré à la main sur org_id + kind.
    const { data: reportRaw, error: reportErr } = await admin
      .from("reports")
      .select("id, report_date, shift_label, html, created_at")
      .eq("org_id", profile.org_id)
      .eq("kind", "handover")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Clé tronquée / droits refusés → erreur de requête (pas un throw) : on
    // bascule sur la carte propre plutôt que d'afficher un état faussement vide.
    if (reportErr) throw reportErr;

    report = reportRaw as Report | null;

    // Effectif de l'org → « X / Y ont lu » dans les accusés de lecture.
    const { count } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("org_id", profile.org_id);
    memberCount = count ?? undefined;

    if (report) {
      const { data: readsRaw } = await admin
        .from("report_reads")
        .select("user_id, read_at")
        .eq("report_id", report.id);

      const rawReads = (readsRaw ?? []) as { user_id: string; read_at: string }[];

      if (rawReads.length > 0) {
        const { data: usersRaw } = await admin
          .from("users")
          .select("id, display_name")
          .in(
            "id",
            rawReads.map((r) => r.user_id),
          );

        const nameMap = Object.fromEntries(
          (usersRaw ?? []).map(
            (u: { id: string; display_name: string | null }) => [
              u.id,
              u.display_name ?? "Utilisateur",
            ],
          ),
        );

        reads = rawReads.map((r) => ({
          ...r,
          display_name: nameMap[r.user_id] ?? r.user_id.slice(0, 8) + "…",
        }));
      }
    }
  } catch (err) {
    console.error("[handover] client admin indisponible:", err);
    adminUnavailable = true;
  }

  if (adminUnavailable) {
    return (
      <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
        <div className="mx-auto w-full max-w-md px-5 pb-10 pt-8">
          <header className="mb-6">
            <p className="eyebrow">Relais d&apos;équipe</p>
            <h1 className="mt-1 text-xl font-semibold text-secondary">Passation</h1>
          </header>
          {/* Carte « indisponible » — ton calme, jamais une 500 brute (clé service_role absente). */}
          <div className="flex flex-col items-center gap-3 rounded-card bg-card px-6 py-12 text-center shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-field bg-amber-tint text-amber">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-secondary">
              Passation momentanément indisponible
            </h2>
            <p className="max-w-xs text-sm text-on-surface-variant">
              On ne parvient pas à charger le relais en ce moment. Revenez dans
              un instant — vos notes et vos tâches sont bien là.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-8">
        <header className="mb-6">
          <p className="eyebrow">Relais d&apos;équipe</p>
          <h1 className="mt-1 text-xl font-semibold text-secondary">Passation</h1>
          <p className="mt-1.5 text-xs text-on-surface-variant">
            Le relais pour l&apos;équipe qui prend le poste — tâches en cours,
            bloquées, décisions du jour.
          </p>
        </header>

        {report ? (
          <div className="space-y-4">
            <ReportCard
              report={report}
              reads={reads}
              currentUserId={user.id}
              memberCount={memberCount ?? undefined}
              kindLabel="Passation"
            />
            {/* Régénérer pour la relève suivante */}
            <GenerateHandoverButton />
          </div>
        ) : (
          // État vide = onboarding : icône + titre + une phrase + le CTA de génération.
          <div className="flex flex-col items-center gap-3 rounded-card bg-card px-6 py-12 text-center shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-field bg-azure text-primary">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8M16 17H8M10 9H8" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-secondary">
              Pas encore de passation
            </h2>
            <p className="max-w-xs text-sm text-on-surface-variant">
              Scribe agrège les tâches en cours, les points bloqués et les
              décisions du jour en un relais prêt à transmettre au shift suivant.
            </p>
            {/* Angle de marque : la nuit décide, le jour le sait. */}
            <p className="max-w-xs text-xs italic text-on-surface-variant">
              L&apos;équipe de nuit a décidé. À 6h, l&apos;équipe de jour le sait.
            </p>
            <div className="mt-2">
              <GenerateHandoverButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
