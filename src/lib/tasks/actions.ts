"use server";

import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";
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

// Met à jour un champ de tâche dans le tableau JSONB extracted_tasks_json.
//
// SÉCURITÉ (règle d'or n°2) : on garde le client admin — un coéquipier doit
// pouvoir valider/terminer une tâche extraite de la note d'un AUTRE membre
// (la coordination est le cœur du produit, et la policy RLS `entries_update_own`
// limiterait à l'auteur seul). MAIS on refiltre STRICTEMENT sur l'org_id de
// l'utilisateur courant, lu via la session — plus aucune fuite cross-org.
export async function updateTask(
  entryId: string,
  taskIndex: number,
  updates: TaskUpdates,
): Promise<{ error?: string }> {
  try {
    // 1. Identité + org via la session (source de vérité de l'isolation).
    const session = await createSessionClient();
    const {
      data: { user },
    } = await session.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    const { data: profile } = await session
      .from("users")
      .select("org_id")
      .eq("id", user.id)
      .single();
    if (!profile?.org_id) return { error: "Organisation introuvable" };

    const supabase = adminClient();

    // 2. Lecture filtrée sur l'org : impossible de lire l'entrée d'une autre org.
    const { data: entry, error: fetchError } = await supabase
      .from("entries")
      .select("extracted_tasks_json")
      .eq("id", entryId)
      .eq("org_id", profile.org_id)
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

    // 3. Écriture filtrée sur l'org : impossible d'écrire dans une autre org.
    const { error: updateError } = await supabase
      .from("entries")
      .update({ extracted_tasks_json: tasks })
      .eq("id", entryId)
      .eq("org_id", profile.org_id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/dashboard/tasks");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
