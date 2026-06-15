"use client";

import { useState, useTransition } from "react";
import { markRead } from "@/lib/reports/actions";
import { sanitizeReportHtml } from "@/lib/sanitize";
import ReadReceiptList, { type Receipt } from "@/components/ReadReceiptList";

export type Report = {
  id: string;
  report_date: string;
  shift_label: string;
  html: string;
  created_at: string;
};

export type ReportRead = Receipt;

type Props = {
  report: Report;
  reads: ReportRead[];
  currentUserId: string;
  memberCount?: number;
  // Libellé du type de document (« Rapport du soir » / « Passation »).
  kindLabel?: string;
};

// Carte rapport / passation — HTML sanitizé + accusés de lecture chiffrés.
// Migrée sur les tokens Scribe (rupture nette avec la palette Atelier Klar).
export default function ReportCard({
  report,
  reads,
  currentUserId,
  memberCount,
  kindLabel = "Rapport",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const alreadyRead = reads.some((r) => r.user_id === currentUserId);

  // Sanitization côté client à l'affichage : on ne fait jamais confiance au HTML LLM.
  const [safeHtml] = useState(() => sanitizeReportHtml(report.html));

  const dateLabel = new Date(report.report_date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{dateLabel}</p>
          <h2 className="text-lg font-semibold text-cloud-50">{kindLabel}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-accent-blue/15 px-3 py-1 text-xs font-medium text-accent-blue">
          {report.shift_label}
        </span>
      </div>

      {/* Contenu HTML sanitizé */}
      <div
        className="rounded-xl bg-ink-700 px-5 py-4 text-sm leading-relaxed text-cloud-50 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-accent-cyan [&_hr]:my-3 [&_hr]:border-ink-600 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_ul]:space-y-1"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* Accusés de lecture */}
      <ReadReceiptList
        receipts={reads}
        publishedAt={report.created_at}
        memberCount={memberCount}
      />

      {/* Bouton « J'ai lu » — marque l'accusé de lecture pour l'utilisateur courant */}
      {!alreadyRead && (
        <button
          onClick={() => startTransition(async () => void (await markRead(report.id)))}
          disabled={isPending}
          className="min-h-[44px] w-full rounded-xl py-3 text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-50"
          style={{ background: "var(--gradient-brand)" }}
        >
          {isPending ? "…" : "Marquer comme lu"}
        </button>
      )}
      {alreadyRead && (
        <p className="inline-flex items-center gap-2 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Vous avez marqué ce rapport comme lu
        </p>
      )}
    </div>
  );
}
