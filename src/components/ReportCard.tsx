"use client";

import { markRead } from "@/lib/reports/actions";

export type Report = {
  id: string;
  report_date: string;
  shift_label: string;
  html: string;
  created_at: string;
};

export type ReportRead = {
  user_id: string;
  read_at: string;
  display_name?: string;
};

type Props = {
  report: Report;
  reads: ReportRead[];
  currentUserId: string;
};

// Carte rapport quotidien — affiche le HTML + accusés de lecture.
export default function ReportCard({ report, reads, currentUserId }: Props) {
  const alreadyRead = reads.some((r) => r.user_id === currentUserId);

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "#A8804D" }}>
            {new Date(report.report_date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "#F0E8D6" }}>
            Rapport du soir
          </h2>
        </div>
        <span className="rounded-full px-3 py-1 text-xs" style={{ background: "#A8804D", color: "#0A0708" }}>
          {report.shift_label}
        </span>
      </div>

      {/* Contenu HTML du rapport */}
      <div
        className="rounded-xl px-5 py-4 text-sm leading-relaxed"
        style={{ background: "rgba(255,255,255,0.03)", color: "#F0E8D6" }}
        dangerouslySetInnerHTML={{ __html: report.html }}
      />

      {/* Accusés de lecture */}
      <hr style={{ borderColor: "rgba(168,128,77,0.2)" }} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#A8804D" }}>
            Lu par :
          </span>
          {reads.length > 0 ? (
            <span className="text-xs" style={{ color: "#F0E8D6", opacity: 0.7 }}>
              {reads.map((r) => r.display_name || r.user_id.slice(0, 8)).join(", ")}
            </span>
          ) : (
            <span className="text-xs" style={{ color: "#F0E8D6", opacity: 0.4 }}>
              Personne
            </span>
          )}
        </div>

        {!alreadyRead && (
          <button
            onClick={async () => await markRead(report.id)}
            className="rounded-lg px-4 py-2 text-xs font-medium min-h-[44px] transition-opacity hover:opacity-80"
            style={{ background: "#6E1F2C", color: "#F0E8D6" }}
          >
            J&apos;ai lu
          </button>
        )}
      </div>
    </div>
  );
}
