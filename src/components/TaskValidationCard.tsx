"use client";

import { useState, useTransition } from "react";
import {
  validateTask,
  rejectTask,
  completeTask,
} from "@/lib/tasks/actions";

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

// Pastille de priorité — couleur + libellé (jamais la couleur seule, brand guide §7).
const PRIORITY_STYLE: Record<Task["priority"], { dot: string; label: string }> = {
  haute: { dot: "bg-error", label: "Haute" },
  moyenne: { dot: "bg-secondary", label: "Moyenne" },
  basse: { dot: "bg-primary", label: "Basse" },
};

// Carte de validation humaine (règle d'or n°4). L'IA propose une tâche ; un humain
// l'Accepte / la Modifie / la Rejette. Tant qu'elle n'est pas validée, aucune
// escalade n'est légitime — le statut « À confirmer » le matérialise.
export default function TaskValidationCard({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  const style = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.basse;
  const status = task.status ?? "proposed";
  const isProposed = status === "proposed";
  const isValidated = status === "validated";
  const isDone = status === "done";
  const isRejected = status === "rejected";

  const run = (fn: () => Promise<{ error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  };

  const accept = () => run(() => validateTask(task.entryId, task.taskIndex));
  const reject = () => run(() => rejectTask(task.entryId, task.taskIndex));
  const complete = () => run(() => completeTask(task.entryId, task.taskIndex));
  const saveEdit = () => {
    const title = draft.trim();
    if (!title) return;
    run(() =>
      validateTask(task.entryId, task.taskIndex, { title }).then((r) => {
        if (!r?.error) setEditing(false);
        return r;
      }),
    );
  };

  // Badge de statut : forme pilule + mot + couleur (brand guide §5).
  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    proposed: { label: "À confirmer", cls: "bg-azure text-secondary" },
    validated: { label: "Active", cls: "bg-azure text-primary" },
    done: { label: "Terminé", cls: "bg-surface-container text-on-surface-variant" },
    rejected: { label: "Rejetée", cls: "bg-surface-container text-outline" },
  };
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.proposed;

  return (
    <div
      className={`mb-3 overflow-hidden rounded-card bg-white shadow-card ${
        isDone || isRejected ? "opacity-60" : ""
      }`}
    >
      {/* Accent latéral pour les cartes « à valider » (brand guide §5). */}
      <div className="flex">
        <span
          aria-hidden
          className={`w-[3px] shrink-0 ${isProposed ? "bg-primary" : "bg-transparent"}`}
        />
        <div className="min-w-0 flex-1 p-6">
          {/* En-tête : priorité + statut */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-surface-container px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-on-surface">
              <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
              {style.label}
            </span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badge.cls}`}
            >
              {badge.label}
            </span>
          </div>

          {/* Titre — éditable en mode « Modifier » */}
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
              className="w-full resize-none rounded-field bg-surface-container-low p-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p
              className={`text-sm font-medium leading-snug text-on-surface ${
                isDone ? "line-through" : ""
              }`}
            >
              {task.title}
            </p>
          )}

          {/* Assigné + échéance suggérés */}
          {(task.assignee_suggestion || task.deadline_suggestion) && (
            <div className="mt-2 flex flex-wrap gap-4">
              {task.assignee_suggestion && (
                <p className="text-xs text-primary">
                  → {task.assignee ?? task.assignee_suggestion}
                </p>
              )}
              {task.deadline_suggestion && (
                <p className="text-xs text-outline">{task.deadline_suggestion}</p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-2 rounded-field bg-error-container px-3 py-2 text-xs text-on-error-container">
              {error}
            </p>
          )}

          {/* Actions selon l'état */}
          <div className="mt-3 flex flex-wrap gap-2">
            {editing ? (
              <>
                <button
                  onClick={saveEdit}
                  disabled={isPending || !draft.trim()}
                  className="flex min-h-[36px] flex-1 items-center justify-center rounded-pill bg-primary py-2 text-xs font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
                >
                  {isPending ? "…" : "Enregistrer et valider"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraft(task.title);
                  }}
                  disabled={isPending}
                  className="min-h-[36px] rounded-pill bg-azure px-3 py-2 text-xs font-medium text-primary transition-all hover:brightness-95 disabled:opacity-40"
                >
                  Annuler
                </button>
              </>
            ) : isProposed ? (
              <>
                <button
                  onClick={accept}
                  disabled={isPending}
                  className="flex min-h-[36px] flex-1 items-center justify-center rounded-pill bg-primary py-2 text-xs font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
                >
                  {isPending ? "…" : "Accepter"}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  disabled={isPending}
                  className="min-h-[36px] rounded-pill bg-azure px-3 py-2 text-xs font-medium text-primary transition-all hover:brightness-95 disabled:opacity-40"
                >
                  Modifier
                </button>
                <button
                  onClick={reject}
                  disabled={isPending}
                  className="min-h-[36px] rounded-pill px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error-container disabled:opacity-40"
                >
                  Rejeter
                </button>
              </>
            ) : isValidated ? (
              <button
                onClick={complete}
                disabled={isPending}
                className="flex min-h-[36px] flex-1 items-center justify-center rounded-pill bg-primary py-2 text-xs font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
              >
                {isPending ? "…" : "Marquer comme terminé"}
              </button>
            ) : isRejected ? (
              <button
                onClick={accept}
                disabled={isPending}
                className="min-h-[36px] rounded-pill bg-azure px-3 py-2 text-xs font-medium text-primary transition-all hover:brightness-95 disabled:opacity-40"
              >
                {isPending ? "…" : "Rétablir"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
