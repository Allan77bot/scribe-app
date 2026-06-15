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
      <div className="flex flex-col items-center gap-3 rounded-card bg-white px-6 py-12 text-center shadow-card">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="text-primary"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <h2 className="text-base font-semibold text-secondary">
          Aucune tâche pour l&apos;instant
        </h2>
        <p className="max-w-xs text-sm text-on-surface-variant">
          Dictez ou collez une note — Scribe en extrait les tâches, vous les
          confirmez d&apos;un tap.
        </p>
        <Link
          href="/dashboard/capture"
          className="mt-2 flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">
            À confirmer ({pending.length})
          </h2>
          {PRIORITY_ORDER.map((priority) => {
            const group = grouped[priority];
            if (group.length === 0) return null;
            return (
              <div key={priority} className="mb-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-outline">
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
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
