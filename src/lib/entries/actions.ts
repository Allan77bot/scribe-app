"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { processEntry } from "@/lib/pipeline/actions";

// Crée une entrée puis déclenche le pipeline IA pour les entrées audio.
export async function createEntry(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Récupération de l'org_id via le profil — la RLS garantit qu'on ne lit que le sien
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/dashboard?error=no-org");

  const type = String(formData.get("type") ?? "text") as "audio" | "text";
  const rawText = String(formData.get("raw_text") ?? "").trim() || null;
  const storagePath =
    String(formData.get("storage_path") ?? "").trim() || null;

  const { data: entry, error: insertError } = await supabase
    .from("entries")
    .insert({
      org_id: profile.org_id,
      user_id: user.id,
      type,
      raw_text: rawText,
      storage_path: storagePath,
    })
    .select("id")
    .single();

  if (insertError || !entry) {
    console.error("[entries:createEntry] insert:", insertError?.message);
    redirect("/dashboard?error=create-failed");
  }

  // Pipeline IA pour les entrées audio (transcription + extraction de tâches)
  if (type === "audio") {
    try {
      const result = await processEntry(entry.id);
      if (result.error) {
        console.error("[entries:createEntry] pipeline:", result.error);
      }
    } catch (err) {
      console.error("[entries:createEntry] pipeline unexpected:", err);
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
