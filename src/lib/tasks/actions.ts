"use server";

import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Client admin (service_role) — côté serveur uniquement, jamais exposé au navigateur.
function adminClient() {
  return createAdminSupabase(
    // SUPABASE_URL n'existe pas sur Vercel — l'URL canonique est NEXT_PUBLIC_SUPABASE_URL.
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Décision humaine matérialisée (règle d'or n°4) : 'validated' = acceptée (le timer
// d'escalade peut démarrer), 'rejected' = écartée, 'done' = terminée après validation.
export type ValidationStatus = "validated" | "rejected" | "done";

// Champs modifiables au moment de l'acceptation (boucle Accept/Modifier/Rejeter).
type TaskEdits = {
  title?: string;
  priority?: "haute" | "moyenne" | "basse";
  assignee?: string | null;
  deadline_suggestion?: string | null;
};

// Identité + org via la session : SOURCE DE VÉRITÉ de l'isolation (règle d'or n°2).
async function requireOrg() {
  const session = await createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return { error: "Non authentifié" as const };

  const { data: profile } = await session
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return { error: "Organisation introuvable" as const };

  return { session, user, orgId: profile.org_id as string };
}

// Écrit le statut (+ éventuelles modifications) dans le tableau JSONB extracted_tasks_json.
// SÉCURITÉ : client admin (un coéquipier valide la note d'un AUTRE membre — c'est le
// cœur de la coordination), MAIS strictement refiltré sur l'org_id de la session.
async function writeTaskField(
  orgId: string,
  entryId: string,
  taskIndex: number,
  patch: Record<string, unknown>,
): Promise<{ error?: string }> {
  const supabase = adminClient();

  const { data: entry, error: fetchError } = await supabase
    .from("entries")
    .select("extracted_tasks_json")
    .eq("id", entryId)
    .eq("org_id", orgId)
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

  tasks[taskIndex] = { ...tasks[taskIndex], ...patch };

  const { error: updateError } = await supabase
    .from("entries")
    .update({ extracted_tasks_json: tasks })
    .eq("id", entryId)
    .eq("org_id", orgId);

  return updateError ? { error: updateError.message } : {};
}

// Pose la décision humaine (qui, quand, quoi) dans task_validations via la SESSION :
// la policy RLS impose validated_by = auth.uid() → attribution non falsifiable.
// Upsert sur (entry_id, task_index) : la dernière décision fait foi, traçable.
async function recordValidation(
  session: Awaited<ReturnType<typeof createSessionClient>>,
  orgId: string,
  userId: string,
  entryId: string,
  taskIndex: number,
  status: ValidationStatus,
): Promise<{ error?: string }> {
  const { error } = await session.from("task_validations").upsert(
    {
      org_id: orgId,
      entry_id: entryId,
      task_index: taskIndex,
      status,
      validated_by: userId,
      validated_at: new Date().toISOString(),
    },
    { onConflict: "entry_id,task_index" },
  );
  return error ? { error: error.message } : {};
}

// Boucle de validation humaine — la pièce qui manquait au produit (audit UX §2).
// L'IA *propose* ; un humain *confirme/modifie/rejette* ; SEULEMENT ensuite la tâche
// devient active (le timer d'escalade pourrait démarrer). Écrit le statut JSON (qui
// pilote l'affichage) ET la trace attribuée dans task_validations.
async function decide(
  entryId: string,
  taskIndex: number,
  status: ValidationStatus,
  edits?: TaskEdits,
): Promise<{ error?: string }> {
  try {
    const ctx = await requireOrg();
    if ("error" in ctx) return { error: ctx.error };

    // Le statut JSON reflète la décision ; on applique aussi les modifications
    // éventuelles (cas « Modifier » de la boucle Accept/Modifier/Rejeter).
    const patch: Record<string, unknown> = { status, ...(edits ?? {}) };

    const wrote = await writeTaskField(ctx.orgId, entryId, taskIndex, patch);
    if (wrote.error) return wrote;

    const traced = await recordValidation(
      ctx.session,
      ctx.orgId,
      ctx.user.id,
      entryId,
      taskIndex,
      status,
    );
    if (traced.error) return traced;

    revalidatePath("/dashboard/tasks");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

// Accepter (avec modifications optionnelles) → tâche active, validée par un humain.
export async function validateTask(
  entryId: string,
  taskIndex: number,
  edits?: TaskEdits,
): Promise<{ error?: string }> {
  return decide(entryId, taskIndex, "validated", edits);
}

// Rejeter → la tâche proposée est écartée (jamais d'escalade sur une tâche rejetée).
export async function rejectTask(
  entryId: string,
  taskIndex: number,
): Promise<{ error?: string }> {
  return decide(entryId, taskIndex, "rejected");
}

// Terminer → clôture après validation.
export async function completeTask(
  entryId: string,
  taskIndex: number,
): Promise<{ error?: string }> {
  return decide(entryId, taskIndex, "done");
}
