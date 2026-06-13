"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { processEntry } from "@/lib/pipeline/actions";

// Client admin (service_role) — côté serveur uniquement, jamais exposé au navigateur.
function adminClient() {
  return createAdminSupabase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Génère une URL signée d'upload vers le bucket audio-uploads.
// Chemin : {userId}/{timestamp}-{fileName}.webm
export async function getSignedUploadUrl(
  fileName: string,
): Promise<{ signedUrl: string; path: string }> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const timestamp = Date.now();
  const path = `${user.id}/${timestamp}-${fileName}.webm`;

  const admin = adminClient();
  const { data, error } = await admin.storage
    .from("audio-uploads")
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "Impossible de créer l'URL signée");
  }

  return { signedUrl: data.signedUrl, path };
}

// Insère une entrée puis déclenche le pipeline IA pour les entrées audio.
export async function createEntry(formData: FormData) {
  const supabase = await createSessionClient();

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
