import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TaskList from "@/components/TaskList";
import type { Task } from "@/components/TaskCard";

type RawTask = {
  title: string;
  priority: "haute" | "moyenne" | "basse";
  assignee_suggestion: string | null;
  deadline_suggestion: string | null;
  status?: string;
  assignee?: string | null;
};

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // La RLS garantit qu'on ne lit que les entrées de son org.
  const { data: entries, error } = await supabase
    .from("entries")
    .select("id, extracted_tasks_json")
    .not("extracted_tasks_json", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[tasks:page] fetch:", error.message);
  }

  // Aplatissement : chaque tâche garde une référence à son entry_id et son index
  const tasks: Task[] = (entries ?? []).flatMap((entry) => {
    const raw = entry.extracted_tasks_json as RawTask[] | null;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((t, i) => ({
      entryId: entry.id as string,
      taskIndex: i,
      title: t.title,
      priority: t.priority,
      assignee_suggestion: t.assignee_suggestion,
      deadline_suggestion: t.deadline_suggestion,
      status: t.status,
      assignee: t.assignee,
    }));
  });

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-cloud-50">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Tâches extraites</h1>
          <p className="mt-1 text-xs text-muted">
            {tasks.length} tâche{tasks.length !== 1 ? "s" : ""} au total
          </p>
        </header>

        <TaskList tasks={tasks} />
      </div>
    </main>
  );
}
