"use client";

import { useTransition } from "react";
import { updateTask } from "@/lib/tasks/actions";

export type Task = {
  entryId: string;
  taskIndex: number;
  title: string;
  priority: "haute" | "moyenne" | "basse";
  assignee_suggestion: string | null;
  deadline_suggestion: string | null;
  status?: string;
  assignee?: string | null;
};

// Pastille de priorité — couleur + libellé (jamais la couleur seule, cf. brand guide §7).
const PRIORITY_STYLE: Record<
  Task["priority"],
  { dot: string; label: string }
> = {
  haute: { dot: "bg-prio-high", label: "Haute" },
  moyenne: { dot: "bg-prio-med", label: "Moyenne" },
  basse: { dot: "bg-prio-low", label: "Basse" },
};

export default function TaskCard({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const style = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.basse;

  const isDone = task.status === "done";
  const isValidated = task.status === "validated" || isDone;

  const handleStatus = (newStatus: string) => {
    startTransition(async () => {
      await updateTask(task.entryId, task.taskIndex, { status: newStatus });
    });
  };

  return (
    <div
      className={`mb-3 rounded-xl bg-ink-700 p-4 transition-opacity ${
        isDone ? "opacity-55" : ""
      }`}
    >
      {/* Pastille priorité + titre */}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cloud-50">
          <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
          {style.label}
        </span>
        <p
          className={`text-sm font-medium leading-snug text-cloud-50 ${
            isDone ? "line-through" : ""
          }`}
        >
          {task.title}
        </p>
      </div>

      {/* Assigné + deadline */}
      {(task.assignee_suggestion || task.deadline_suggestion) && (
        <div className="mt-2 flex flex-wrap gap-4">
          {task.assignee_suggestion && (
            <p className="text-xs text-accent-cyan">
              → {task.assignee ?? task.assignee_suggestion}
            </p>
          )}
          {task.deadline_suggestion && (
            <p className="text-xs text-hint">{task.deadline_suggestion}</p>
          )}
        </div>
      )}

      {/* Boutons de statut — masqués si la tâche est terminée */}
      {!isDone && (
        <div className="mt-3 flex gap-2">
          {!isValidated && (
            <button
              onClick={() => handleStatus("validated")}
              disabled={isPending}
              className="min-h-[36px] flex-1 rounded-lg border border-ink-600 py-2 text-xs font-medium text-cloud-50 transition-colors hover:border-accent-cyan disabled:opacity-40"
            >
              {isPending ? "…" : "Valider"}
            </button>
          )}
          <button
            onClick={() => handleStatus("done")}
            disabled={isPending}
            className={`min-h-[36px] flex-1 rounded-lg py-2 text-xs font-medium transition-opacity disabled:opacity-40 ${
              isValidated
                ? "text-cloud-50"
                : "border border-ink-600 text-cloud-50"
            }`}
            style={
              isValidated ? { background: "var(--gradient-accent)" } : undefined
            }
          >
            {isPending ? "…" : "Terminé"}
          </button>
        </div>
      )}

      {isDone && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Terminé
        </p>
      )}
    </div>
  );
}
