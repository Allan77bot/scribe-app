import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import ReportCard, { type Report, type ReportRead } from "@/components/ReportCard";
import GenerateReportButton from "@/components/GenerateReportButton";

function adminClient() {
  return createAdminSupabase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function ReportPage() {
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

  // Dernier rapport de l'org — admin client pour bypasser la RLS qu'on gère via org_id
  const { data: reportRaw } = await admin
    .from("reports")
    .select("id, report_date, shift_label, html, created_at")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const report = reportRaw as Report | null;

  let reads: ReportRead[] = [];

  if (report) {
    const { data: readsRaw } = await admin
      .from("report_reads")
      .select("report_id, user_id, read_at")
      .eq("report_id", report.id);

    const rawReads = (readsRaw ?? []) as {
      report_id: string;
      user_id: string;
      read_at: string;
    }[];

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

  const dateLabel = report
    ? (() => {
        const [y, m, d] = report.report_date.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      })()
    : null;

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-cloud-50">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Rapport du soir</h1>
          {dateLabel && (
            <p className="mt-1 text-xs text-muted">
              {dateLabel} · {report!.shift_label}
            </p>
          )}
        </header>

        {report ? (
          <ReportCard report={report} reads={reads} currentUserId={user.id} />
        ) : (
          // État vide = onboarding : titre + une phrase + le CTA de génération.
          <div className="flex flex-col items-center gap-3 rounded-xl bg-ink-700 px-6 py-10 text-center">
            <h2 className="text-base font-semibold text-cloud-50">
              Pas encore de rapport
            </h2>
            <p className="max-w-xs text-sm text-muted">
              Scribe agrège les tâches et décisions du jour en une passation
              prête à partager. Lancez la génération du premier rapport.
            </p>
            <div className="mt-2">
              <GenerateReportButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
