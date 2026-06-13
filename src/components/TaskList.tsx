import TaskCard, { type Task } from "@/components/TaskCard";

const PRIORITY_ORDER: Task["priority"][] = ["haute", "moyenne", "basse"];

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  haute: "Priorité haute",
  moyenne: "Priorité moyenne",
  basse: "Priorité basse",
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p
        className="py-12 text-center text-sm"
        style={{ color: "#F0E8D6", opacity: 0.35 }}
      >
        Aucune tâche extraite pour le moment.
      </p>
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
            <h2
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#A8804D" }}
            >
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
