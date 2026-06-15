import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import ReportCard, { type Report, type ReportRead } from "@/components/ReportCard";
import GenerateHandoverButton from "@/components/GenerateHandoverButton";

function adminClient() {
  return createAdminSupabase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
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

  const admin = adminClient();

  // Dernière passation de l'org — admin client filtré à la main sur org_id + kind.
  const { data: reportRaw } = await admin
    .from("reports")
    .select("id, report_date, shift_label, html, created_at")
    .eq("org_id", profile.org_id)
    .eq("kind", "handover")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const report = reportRaw as Report | null;

  // Effectif de l'org → « X / Y ont lu » dans les accusés de lecture.
  const { count: memberCount } = await admin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("org_id", profile.org_id);

  let reads: ReportRead[] = [];
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
        (usersRaw ?? []).map((u: { id: string; display_name: string | null }) => [
          u.id,
          u.display_name ?? "Utilisateur",
        ]),
      );

      reads = rawReads.map((r) => ({
        ...r,
        display_name: nameMap[r.user_id] ?? r.user_id.slice(0, 8) + "…",
      }));
    }
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-cloud-50">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Passation</h1>
          <p className="mt-1 text-xs text-muted">
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
          // État vide = onboarding : titre + une phrase + le CTA de génération.
          <div className="flex flex-col items-center gap-3 rounded-xl bg-ink-700 px-6 py-10 text-center">
            <h2 className="text-base font-semibold text-cloud-50">
              Pas encore de passation
            </h2>
            <p className="max-w-xs text-sm text-muted">
              Scribe agrège les tâches en cours, les points bloqués et les
              décisions du jour en un relais prêt à transmettre au shift suivant.
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
