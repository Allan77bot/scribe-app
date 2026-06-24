"use client";

import { useState, useTransition } from "react";
import { markRead } from "@/lib/reports/actions";
import { sanitizeReportHtml } from "@/lib/sanitize";
import ReadReceiptList, { type Receipt } from "@/components/ReadReceiptList";
import { Button } from "@/components/ui/Button";

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
    <div className="flex flex-col gap-5 rounded-card bg-card p-6 shadow-card">
      {/* En-tête — eyebrow (type de document) + date lisible, pastille shift à droite. */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{kindLabel}</p>
          <h2 className="mt-1 text-lg font-semibold capitalize text-secondary">
            {dateLabel}
          </h2>
        </div>
        <span className="shrink-0 rounded-pill bg-azure px-3 py-1 text-xs font-medium text-primary">
          {report.shift_label}
        </span>
      </div>

      {/* Contenu LLM sanitizé. Les sections (H2) sont mises en valeur : titres cobalt
          espacés, première section sans marge haute, listes aérées — un relais qui se
          lit, pas un bloc HTML brut. */}
      <div
        className="text-sm leading-relaxed text-on-surface [&>*:first-child]:mt-0 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-secondary [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:border-l-2 [&_h2]:border-primary [&_h2]:pl-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.03em] [&_h2]:text-primary [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-secondary [&_hr]:my-4 [&_hr]:border-outline-variant [&_li]:ml-4 [&_li]:list-disc [&_li]:marker:text-outline-variant [&_p]:mb-2 [&_ul]:space-y-1.5"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* Accusés de lecture */}
      <ReadReceiptList
        receipts={reads}
        publishedAt={report.created_at}
        memberCount={memberCount}
      />

      {/* Bouton « Marquer comme lu » — Button DS, action que l'utilisateur contrôle. */}
      {!alreadyRead && (
        <Button
          fullWidth
          onClick={() => startTransition(async () => void (await markRead(report.id)))}
          disabled={isPending}
        >
          {isPending ? "…" : "Marquer comme lu"}
        </Button>
      )}
      {alreadyRead && (
        <p className="inline-flex items-center gap-2 rounded-field bg-cyan-tint px-3 py-2 text-xs font-medium text-cyan-text">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Vous avez marqué ce document comme lu
        </p>
      )}
    </div>
  );
}
