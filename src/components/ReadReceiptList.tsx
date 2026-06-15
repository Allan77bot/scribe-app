// Accusés de lecture (modèle Loom Viewer Insights — audit UX §2). Affiche qui a lu,
// quand, et le temps écoulé entre la publication et la lecture. Présentationnel :
// les données (RLS-safe) sont chargées côté serveur via report_reads.

export type Receipt = {
  user_id: string;
  read_at: string;
  display_name?: string;
};

// Formate un délai en libellé court FR (« 4 min », « 2 h », « 1 j »).
function formatDelay(ms: number): string {
  if (ms < 0) return "—";
  const min = Math.round(ms / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} j`;
}

type Props = {
  receipts: Receipt[];
  // Date de publication du rapport — base du calcul « temps avant lecture ».
  publishedAt: string;
  // Total de membres de l'org (pour « 2 / 5 ont lu »). Optionnel.
  memberCount?: number;
};

export default function ReadReceiptList({
  receipts,
  publishedAt,
  memberCount,
}: Props) {
  const publishedMs = new Date(publishedAt).getTime();

  // Temps moyen avant lecture (chiffre tabulaire — brand guide §3).
  const avgDelay =
    receipts.length > 0
      ? receipts.reduce(
          (acc, r) => acc + (new Date(r.read_at).getTime() - publishedMs),
          0,
        ) / receipts.length
      : null;

  return (
    <div className="rounded-xl bg-ink-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cloud-50">Accusés de lecture</h3>
        <span className="text-xs tabular-nums text-muted">
          {memberCount
            ? `${receipts.length} / ${memberCount} ont lu`
            : `${receipts.length} lecture${receipts.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {receipts.length === 0 ? (
        <p className="text-xs text-hint">
          Personne n&apos;a encore ouvert ce rapport.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {receipts.map((r) => {
              const delay = new Date(r.read_at).getTime() - publishedMs;
              return (
                <li
                  key={r.user_id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                    />
                    <span className="truncate text-sm text-cloud-50">
                      {r.display_name || r.user_id.slice(0, 8) + "…"}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-hint">
                    {formatDelay(delay)}
                  </span>
                </li>
              );
            })}
          </ul>
          {avgDelay !== null && (
            <p className="mt-3 border-t border-ink-600 pt-3 text-xs text-muted">
              Temps moyen avant lecture :{" "}
              <span className="tabular-nums text-cloud-50">
                {formatDelay(avgDelay)}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
