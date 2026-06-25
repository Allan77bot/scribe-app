// StatusBadge — pastille de statut de tâche (DS « Scribe IA », data-display).
// 4 statuts verrouillés, libellés FR. Le CYAN est réservé à « validated » (Active)
// — jamais en texte courant ; ici le texte passe en cyan foncé (#0E7C92) pour l'AA.
// Matérialise la règle d'or n°4 (proposé → l'humain valide → actif).

export type TaskStatus = "proposed" | "validated" | "done" | "rejected";

const STATUS: Record<TaskStatus, { label: string; cls: string; dot: string }> = {
  proposed: {
    label: "À confirmer",
    cls: "bg-status-proposed-bg text-status-proposed",
    dot: "bg-status-proposed",
  },
  validated: {
    label: "Active",
    cls: "bg-status-validated-bg text-cyan-text",
    dot: "bg-cyan",
  },
  done: {
    label: "Terminé",
    cls: "bg-status-done-bg text-status-done",
    dot: "bg-status-done",
  },
  rejected: {
    label: "Rejeté",
    cls: "bg-status-rejected-bg text-status-rejected",
    dot: "bg-status-rejected",
  },
};

export function StatusBadge({
  status = "proposed",
  label,
  className,
}: {
  status?: TaskStatus;
  label?: string;
  className?: string;
}) {
  const s = STATUS[status] ?? STATUS.proposed;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-semibold ${s.cls} ${className ?? ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {label ?? s.label}
    </span>
  );
}
