import Link from "next/link";
import TaskCard, { type Task } from "@/components/TaskCard";

const PRIORITY_ORDER: Task["priority"][] = ["haute", "moyenne", "basse"];

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  haute: "Priorité haute",
  moyenne: "Priorité moyenne",
  basse: "Priorité basse",
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  // État vide = onboarding (cf. brand guide §5) : titre + une phrase + un CTA.
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-ink-700 px-6 py-12 text-center">
        <h2 className="text-base font-semibold text-cloud-50">
          Aucune tâche pour l&apos;instant
        </h2>
        <p className="max-w-xs text-sm text-muted">
          Dictez ou collez une note — Scribe en extrait les tâches
          automatiquement.
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

  const grouped = PRIORITY_ORDER.reduce<Record<Task["priority"], Task[]>>(
    (acc, p) => {
      acc[p] = tasks.filter((t) => t.priority === p);
      return acc;
    },
    { haute: [], moyenne: [], basse: [] },
  );

  return (
    <div className="space-y-6">
      {PRIORITY_ORDER.map((priority) => {
        const group = grouped[priority];
        if (group.length === 0) return null;
        return (
          <section key={priority}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              {PRIORITY_LABELS[priority]}
            </h2>
            {group.map((task) => (
              <TaskCard key={`${task.entryId}-${task.taskIndex}`} task={task} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
