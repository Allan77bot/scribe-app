"use server";

import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Client admin (service_role) — côté serveur uniquement, jamais exposé au navigateur.
function adminClient() {
  return createAdminSupabase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

type TaskUpdates = {
  status?: string;
  assignee?: string | null;
};

// Met à jour un champ de tâche dans le tableau JSONB extracted_tasks_json
// via lecture-modification-écriture côté admin (RLS bypassée intentionnellement).
export async function updateTask(
  entryId: string,
  taskIndex: number,
  updates: TaskUpdates,
): Promise<{ error?: string }> {
  try {
    const supabase = adminClient();

    const { data: entry, error: fetchError } = await supabase
      .from("entries")
      .select("extracted_tasks_json")
      .eq("id", entryId)
      .single();

    if (fetchError || !entry) {
      return { error: fetchError?.message ?? "Entrée introuvable" };
    }

    const tasks = Array.isArray(entry.extracted_tasks_json)
      ? [...entry.extracted_tasks_json]
      : [];

    if (taskIndex < 0 || taskIndex >= tasks.length) {
      return { error: "Index de tâche invalide" };
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };

    const { error: updateError } = await supabase
      .from("entries")
      .update({ extracted_tasks_json: tasks })
      .eq("id", entryId);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/dashboard/tasks");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
