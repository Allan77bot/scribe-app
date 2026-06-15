import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TaskList from "@/components/TaskList";
import type { Task } from "@/components/TaskValidationCard";

type RawTask = {
  title: string;
  priority: "haute" | "moyenne" | "basse";
  assignee_suggestion: string | null;
  deadline_suggestion: string | null;
  status?: string;
  assignee?: string | null;
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ processing?: string }>;
}) {
  const { processing } = await searchParams;
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
            Scribe propose, vous confirmez — l&apos;escalade ne démarre qu&apos;après
            validation.
          </p>
        </header>

        {/* Machine à états lisible : la capture vient d'être envoyée, le pipeline
            tourne en arrière-plan (audit UX §2 — indicateur de traitement). */}
        {processing && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4">
            <span
              aria-hidden
              className="mt-0.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-accent-cyan"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-cloud-50">
                Transcription en cours…
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Scribe extrait les tâches de votre note. Rechargez dans quelques
                secondes pour les voir apparaître.
              </p>
            </div>
          </div>
        )}

        <TaskList tasks={tasks} />
      </div>
    </main>
  );
}
