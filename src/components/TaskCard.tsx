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

const PRIORITY_STYLE: Record<
  Task["priority"],
  { bg: string; text: string; label: string }
> = {
  haute: { bg: "#6E1F2C", text: "#F0E8D6", label: "Haute" },
  moyenne: { bg: "#A8804D", text: "#F0E8D6", label: "Moyenne" },
  basse: { bg: "#F0E8D6", text: "#0A0708", label: "Basse" },
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
      className="rounded-xl p-4 mb-3 transition-opacity"
      style={{ background: "#1A1214", opacity: isDone ? 0.55 : 1 }}
    >
      {/* Badge priorité + titre */}
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold mt-0.5"
          style={{ background: style.bg, color: style.text }}
        >
          {style.label}
        </span>
        <p
          className="text-sm font-medium leading-snug"
          style={{
            color: "#F0E8D6",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {task.title}
        </p>
      </div>

      {/* Assigné + deadline */}
      {(task.assignee_suggestion || task.deadline_suggestion) && (
        <div className="mt-2 flex flex-wrap gap-4">
          {task.assignee_suggestion && (
            <p className="text-xs" style={{ color: "#A8804D" }}>
              → {task.assignee ?? task.assignee_suggestion}
            </p>
          )}
          {task.deadline_suggestion && (
            <p className="text-xs" style={{ color: "#F0E8D6", opacity: 0.4 }}>
              {task.deadline_suggestion}
            </p>
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
              className="flex-1 rounded-lg py-2 text-xs font-medium min-h-[36px] disabled:opacity-40"
              style={{ background: "#6E1F2C", color: "#F0E8D6" }}
            >
              Valider
            </button>
          )}
          <button
            onClick={() => handleStatus("done")}
            disabled={isPending}
            className="flex-1 rounded-lg py-2 text-xs font-medium min-h-[36px] disabled:opacity-40"
            style={
              isValidated
                ? { background: "#A8804D", color: "#F0E8D6" }
                : {
                    background: "transparent",
                    color: "#F0E8D6",
                    border: "1px solid #A8804D",
                  }
            }
          >
            Terminé
          </button>
        </div>
      )}

      {isDone && (
        <p className="mt-2 text-xs" style={{ color: "#A8804D" }}>
          ✓ Terminé
        </p>
      )}
    </div>
  );
}
