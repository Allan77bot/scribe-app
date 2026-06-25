"use client";

import { useState, useTransition } from "react";
import { validateTask, rejectTask, completeTask } from "@/lib/tasks/actions";
import { StatusBadge, type TaskStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

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

// Pastille de priorité — couleur + libellé (jamais la couleur seule, DS). 3 teintes
// distinctes : haute = rouge, moyenne = ambre (accent chaud rare), basse = cobalt.
const PRIORITY_STYLE: Record<Task["priority"], { dot: string; label: string }> = {
  haute: { dot: "bg-error", label: "Haute" },
  moyenne: { dot: "bg-amber", label: "Moyenne" },
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
  const status = (task.status ?? "proposed") as TaskStatus;
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

  return (
    <div
      className={`mb-3 overflow-hidden rounded-card bg-card shadow-card ${
        isDone || isRejected ? "opacity-60" : ""
      }`}
    >
      {/* Accent latéral cobalt pour les cartes « à confirmer » (action attendue). */}
      <div className="flex">
        <span
          aria-hidden
          className={`w-[3px] shrink-0 ${isProposed ? "bg-primary" : "bg-transparent"}`}
        />
        <div className="min-w-0 flex-1 p-5">
          {/* En-tête : priorité + statut */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-surface-container px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-surface">
              <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
              {style.label}
            </span>
            <StatusBadge status={status} />
          </div>

          {/* Titre — éditable en mode « Modifier » */}
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
              className="w-full resize-none rounded-field bg-surface-container-low p-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p
              className={`text-base font-medium leading-snug text-on-surface ${
                isDone ? "line-through" : ""
              }`}
            >
              {task.title}
            </p>
          )}

          {/* Assigné + échéance suggérés */}
          {(task.assignee_suggestion || task.deadline_suggestion) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {task.assignee_suggestion && (
                <p className="text-xs font-medium text-primary">
                  → {task.assignee ?? task.assignee_suggestion}
                </p>
              )}
              {task.deadline_suggestion && (
                <p className="tnum text-xs text-on-surface-variant">
                  {task.deadline_suggestion}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-2 rounded-field bg-error-container px-3 py-2 text-xs text-on-error-container">
              {error}
            </p>
          )}

          {/* Actions selon l'état — boutons ≥ 44px (cible tactile terrain). */}
          <div className="mt-4 flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  onClick={saveEdit}
                  disabled={isPending || !draft.trim()}
                  className="flex-1"
                >
                  {isPending ? "…" : "Enregistrer et valider"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setDraft(task.title);
                  }}
                  disabled={isPending}
                >
                  Annuler
                </Button>
              </>
            ) : isProposed ? (
              <>
                <Button onClick={accept} disabled={isPending} className="flex-1">
                  {isPending ? "…" : "Accepter"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditing(true)}
                  disabled={isPending}
                >
                  Modifier
                </Button>
                <Button variant="danger" onClick={reject} disabled={isPending}>
                  Rejeter
                </Button>
              </>
            ) : isValidated ? (
              <Button onClick={complete} disabled={isPending} className="flex-1">
                {isPending ? "…" : "Marquer comme terminé"}
              </Button>
            ) : isRejected ? (
              <Button
                variant="secondary"
                onClick={accept}
                disabled={isPending}
              >
                {isPending ? "…" : "Rétablir"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
