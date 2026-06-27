// FAILLE AS-03 (audit 2026-06-27) : ce module était `"use server"`, donc `processEntry`
// était exposé comme server action appelable par N'IMPORTE QUEL client avec un `entryId`
// arbitraire → lecture/écriture en service_role sans contrôle d'appartenance org (IDOR +
// abus de coût IA cross-org). On le passe en `server-only` : `processEntry` n'est plus une
// server action, il n'est appelé QUE côté serveur depuis `entries/actions.ts` via `after()`.
import "server-only";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

type PipelineResult = { error?: string };

type ExtractedTask = {
  title: string;
  priority: "haute" | "moyenne" | "basse";
  assignee_suggestion: string | null;
  deadline_suggestion: string | null;
};

// Client admin (service_role) — côté serveur uniquement, jamais exposé au navigateur.
function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Traite une entrée : transcription audio (Whisper) puis extraction de tâches.
// Stack IA hybride (règle d'or n°5) : transcription Whisper + extraction Haiku 4.5
// (modèle léger). La synthèse du soir, elle, utilise Sonnet 4.6 (cf. reports/handover).
// Lancé en arrière-plan via `after()` depuis createEntry → l'utilisateur n'attend pas.
export async function processEntry(entryId: string): Promise<PipelineResult> {
  try {
    const supabase = adminClient();

    // 1. Récupération de l'entrée (on lit org_id pour décompter le quota après coup).
    const { data: entry, error: fetchError } = await supabase
      .from("entries")
      .select("id, org_id, type, storage_path, raw_text")
      .eq("id", entryId)
      .single();

    if (fetchError || !entry) {
      const msg = fetchError?.message ?? "Entry not found";
      console.error("[pipeline:processEntry] fetch:", msg);
      return { error: msg };
    }

    let transcript = "";
    let durationSeconds = 0;

    // 2. Transcription audio via OpenAI Whisper (bucket privé → client admin).
    //    verbose_json donne la durée réelle → décompte du quota minutes (règle d'or n°5).
    if (entry.type === "audio" && entry.storage_path) {
      const { data: blob, error: downloadError } = await supabase.storage
        .from("audio-uploads")
        .download(entry.storage_path);

      if (downloadError || !blob) {
        const msg = downloadError?.message ?? "Audio download failed";
        console.error("[pipeline:processEntry] storage download:", msg);
        return { error: msg };
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const file = new File([blob], "audio.webm", {
        type: blob.type || "audio/webm",
      });

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
        response_format: "verbose_json",
      });
      transcript = transcription.text;
      // `duration` (secondes) n'est présent qu'en verbose_json.
      durationSeconds =
        (transcription as unknown as { duration?: number }).duration ?? 0;
    } else if (entry.type === "text") {
      transcript = entry.raw_text ?? "";
    }

    // 3. Extraction des tâches via Claude Haiku 4.5 (modèle léger d'extraction — règle d'or n°5).
    let extractedTasks: ExtractedTask[] = [];

    if (transcript.trim()) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: `Tu es un assistant d'extraction de tâches. Analyse le texte fourni et extrais toutes les tâches mentionnées.
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après.
Format : [{"title": "...", "priority": "haute|moyenne|basse", "assignee_suggestion": "...", "deadline_suggestion": "..."}]
Si aucune tâche n'est trouvée, réponds avec : []`,
        messages: [{ role: "user", content: transcript }],
      });

      const rawContent = message.content[0];
      if (rawContent.type === "text") {
        try {
          // Parse JSON défensif (cf. claude-api : ne jamais raw-string-matcher).
          extractedTasks = JSON.parse(rawContent.text);
        } catch {
          console.error(
            "[pipeline:processEntry] JSON parse failed:",
            rawContent.text,
          );
        }
      }
    }

    // 4. Mise à jour de l'entrée avec le résultat du pipeline.
    const { error: updateError } = await supabase
      .from("entries")
      .update({
        transcript,
        extracted_tasks_json: extractedTasks,
        processed_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    if (updateError) {
      console.error("[pipeline:processEntry] update:", updateError.message);
      return { error: updateError.message };
    }

    // 5. Décompte réel du quota minutes (était décoratif — cf. audit UX).
    //    On arrondit à la minute supérieure, jamais en dessous de 1 si du son a été traité.
    if (durationSeconds > 0) {
      const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
      await incrementUsage(entry.org_id, minutes);
    }

    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pipeline:processEntry] unexpected:", msg);
    return { error: msg };
  }
}

// Incrémente minutes_used_this_period de l'org. Lecture + écriture via client admin :
// l'opération est déclenchée par le pipeline (pas une session utilisateur), mais reste
// strictement bornée à l'org_id de l'entrée traitée — aucune fuite cross-org.
async function incrementUsage(orgId: string, minutes: number): Promise<void> {
  const supabase = adminClient();
  const { data: org, error: readError } = await supabase
    .from("organizations")
    .select("minutes_used_this_period")
    .eq("id", orgId)
    .single();

  if (readError || !org) {
    console.error(
      "[pipeline:incrementUsage] read:",
      readError?.message ?? "org introuvable",
    );
    return;
  }

  const next = (org.minutes_used_this_period ?? 0) + minutes;
  const { error: writeError } = await supabase
    .from("organizations")
    .update({ minutes_used_this_period: next })
    .eq("id", orgId);

  if (writeError) {
    console.error("[pipeline:incrementUsage] write:", writeError.message);
  }
}
