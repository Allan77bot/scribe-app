import Link from "next/link";
import TaskValidationCard, {
  type Task,
} from "@/components/TaskValidationCard";

const PRIORITY_ORDER: Task["priority"][] = ["haute", "moyenne", "basse"];

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  haute: "Priorité haute",
  moyenne: "Priorité moyenne",
  basse: "Priorité basse",
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  // État vide = onboarding (brand guide §5) : titre + une phrase + un CTA.
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-ink-700 px-6 py-12 text-center">
        <h2 className="text-base font-semibold text-cloud-50">
          Aucune tâche pour l&apos;instant
        </h2>
        <p className="max-w-xs text-sm text-muted">
          Dictez ou collez une note — Scribe en extrait les tâches, vous les
          confirmez d&apos;un tap.
        </p>
        <Link
          href="/dashboard/capture"
          className="mt-2 min-h-[44px] rounded-xl px-5 py-3 text-sm font-semibold text-cloud-50"
          style={{ background: "var(--gradient-brand)" }}
        >
          Capturer une note
        </Link>
      </div>
    );
  }

  // À confirmer remonte en tête : c'est l'action attendue de l'utilisateur.
  const pending = tasks.filter((t) => (t.status ?? "proposed") === "proposed");
  const settled = tasks.filter((t) => (t.status ?? "proposed") !== "proposed");

  const grouped = PRIORITY_ORDER.reduce<Record<Task["priority"], Task[]>>(
    (acc, p) => {
      acc[p] = pending.filter((t) => t.priority === p);
      return acc;
    },
    { haute: [], moyenne: [], basse: [] },
  );

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-warning">
            À confirmer ({pending.length})
          </h2>
          {PRIORITY_ORDER.map((priority) => {
            const group = grouped[priority];
            if (group.length === 0) return null;
            return (
              <div key={priority} className="mb-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-hint">
                  {PRIORITY_LABELS[priority]}
                </p>
                {group.map((task) => (
                  <TaskValidationCard
                    key={`${task.entryId}-${task.taskIndex}`}
                    task={task}
                  />
                ))}
              </div>
            );
          })}
        </section>
      )}

      {settled.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Suivi ({settled.length})
          </h2>
          {settled.map((task) => (
            <TaskValidationCard
              key={`${task.entryId}-${task.taskIndex}`}
              task={task}
            />
          ))}
        </section>
      )}
    </div>
  );
}
