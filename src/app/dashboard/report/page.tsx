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
    .eq("kind", "report")
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
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-secondary">Rapport du soir</h1>
          {dateLabel && (
            <p className="mt-1 text-xs text-on-surface-variant">
              {dateLabel} · {report!.shift_label}
            </p>
          )}
        </header>

        {report ? (
          <ReportCard
            report={report}
            reads={reads}
            currentUserId={user.id}
            kindLabel="Rapport du soir"
          />
        ) : (
          // État vide = onboarding : icône + titre + une phrase + le CTA de génération.
          <div className="flex flex-col items-center gap-3 rounded-card bg-white px-6 py-10 text-center shadow-card">
            <svg
              className="h-6 w-6 text-primary"
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
            <h2 className="text-base font-semibold text-secondary">
              Pas encore de rapport
            </h2>
            <p className="max-w-xs text-sm text-on-surface-variant">
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
