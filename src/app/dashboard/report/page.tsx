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
    <main
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#0A0708", color: "#F0E8D6" }}
    >
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Rapport du soir</h1>
          {dateLabel && (
            <p className="mt-1 text-xs" style={{ color: "#A8804D" }}>
              {dateLabel} · {report!.shift_label}
            </p>
          )}
        </header>

        {report ? (
          <ReportCard
            report={report}
            reads={reads}
            currentUserId={user.id}
          />
        ) : (
          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{ background: "#1A1214" }}
          >
            <p
              className="text-sm text-center"
              style={{ color: "#F0E8D6", opacity: 0.6 }}
            >
              Aucun rapport. Génère ton premier rapport du soir.
            </p>
            <GenerateReportButton />
          </div>
        )}

        <p
          className="mt-10 text-center text-xs font-mono"
          style={{ color: "#6E1F2C" }}
        >
          PHASE 4 DONE
        </p>
      </div>
    </main>
  );
}
