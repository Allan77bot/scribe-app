"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";

// Rapport quotidien de passation (WF2).
// Synthétise les tâches extraites de la journée en un récap HTML.

export async function generateReport(): Promise<{ id?: string; error?: string }> {
  try {
    const admin = createSupabaseAdmin(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const session = await createSessionClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    const { data: profile } = await admin
      .from("users")
      .select("org_id")
      .eq("id", user.id)
      .single();
    if (!profile?.org_id) return { error: "Organisation introuvable" };

    // Récupère toutes les entrées traitées de l'org pour aujourd'hui
    const today = new Date().toISOString().slice(0, 10);
    const { data: entries, error: fetchError } = await admin
      .from("entries")
      .select("id, type, storage_path, raw_text, transcript, extracted_tasks_json, processed_at, created_at")
      .eq("org_id", profile.org_id)
      .not("processed_at", "is", null)
      .gte("created_at", today + "T00:00:00Z")
      .order("created_at", { ascending: true });

    if (fetchError || !entries?.length) {
      return { error: fetchError?.message ?? "Aucune entrée à synthétiser aujourd'hui" };
    }

    // Construit le prompt pour la synthèse
    const tasksDone: string[] = [];
    const tasksPending: string[] = [];
    let totalEntries = entries.length;

    for (const e of entries) {
      const tasks = (e.extracted_tasks_json as any[]) || [];
      for (const t of tasks) {
        const line = `- ${t.title || "Sans titre"} (priorité: ${t.priority || "—"}, assigné: ${t.assignee_suggestion || "—"})`;
        if (t.status === "fait") {
          tasksDone.push(line);
        } else {
          tasksPending.push(line);
        }
      }
    }

    const prompt = `Tu es un assistant de coordination d'équipe. Génère un rapport de passation quotidien au format HTML à partir des données suivantes.

**RÈGLES DE STYLE :**
- Utilise UNIQUEMENT les balises HTML suivantes : h1, h2, p, ul, li, strong, em, hr
- Pas de CSS inline, pas de classes, pas de style.
- Structure : h1 pour le titre, h2 pour les sections, hr entre les sections.
- Ton professionnel, direct, orienté action. Pas de fioritures.

**DONNÉES :**
- Nombre total d'entrées aujourd'hui : ${totalEntries}
- Tâches terminées (fait) :
${tasksDone.length ? tasksDone.join("\n") : "  Aucune"}
- Tâches en cours / à faire :
${tasksPending.length ? tasksPending.join("\n") : "  Aucune"}

Génère le HTML maintenant.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2048,
      system: prompt,
      messages: [{ role: "user", content: "Génère le rapport HTML." }],
    });

    const html = message.content[0].type === "text" ? message.content[0].text : "<p>Erreur de génération</p>";

    const { data: report, error: insertError } = await admin
      .from("reports")
      .insert({
        org_id: profile.org_id,
        report_date: today,
        shift_label: "jour",
        html,
        generated_by: user.id,
      })
      .select("id")
      .single();

    if (insertError) return { error: insertError.message };

    revalidatePath("/dashboard/report");
    return { id: report?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[reports:generateReport]", msg);
    return { error: msg };
  }
}

// Marque le rapport comme lu par l'utilisateur courant.
export async function markRead(reportId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createSessionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié" };

    const { error } = await supabase
      .from("report_reads")
      .upsert({ report_id: reportId, user_id: user.id, read_at: new Date().toISOString() });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/report");
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[reports:markRead]", msg);
    return { error: msg };
  }
}
