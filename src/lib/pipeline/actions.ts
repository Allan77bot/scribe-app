"use server";

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

// Traite une entrée : transcription audio (Whisper) puis extraction de tâches (Haiku).
// Toujours via le client admin (service_role) — jamais exposé côté client.
export async function processEntry(entryId: string): Promise<PipelineResult> {
  try {
    const supabase = createSupabaseAdmin(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 1. Récupération de l'entrée
    const { data: entry, error: fetchError } = await supabase
      .from("entries")
      .select("id, type, storage_path, raw_text")
      .eq("id", entryId)
      .single();

    if (fetchError || !entry) {
      const msg = fetchError?.message ?? "Entry not found";
      console.error("[pipeline:processEntry] fetch:", msg);
      return { error: msg };
    }

    let transcript = "";

    // 2. Transcription audio via OpenAI Whisper (bucket privé → client admin)
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
      });
      transcript = transcription.text;
    } else if (entry.type === "text") {
      transcript = entry.raw_text ?? "";
    }

    // 3. Extraction des tâches via Claude Haiku (modèle léger d'extraction — règle d'or n°5)
    let extractedTasks: ExtractedTask[] = [];

    if (transcript.trim()) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
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
          extractedTasks = JSON.parse(rawContent.text);
        } catch {
          console.error(
            "[pipeline:processEntry] JSON parse failed:",
            rawContent.text,
          );
        }
      }
    }

    // 4. Mise à jour de l'entrée avec le résultat du pipeline
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

    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pipeline:processEntry] unexpected:", msg);
    return { error: msg };
  }
}
