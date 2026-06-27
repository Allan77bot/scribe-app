"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { processEntry } from "@/lib/pipeline/actions";

// Client admin (service_role) — côté serveur uniquement, jamais exposé au navigateur.
function adminClient() {
  return createAdminSupabase(
    // SUPABASE_URL n'existe pas sur Vercel — l'URL canonique est NEXT_PUBLIC_SUPABASE_URL.
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
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

  // FAILLE AS-02 (audit 2026-06-27) : `storage_path` vient du client, et le pipeline le
  // télécharge ensuite en service_role (hors RLS). Un chemin pointant vers l'audio d'un
  // AUTRE utilisateur/org exfiltrait sa transcription. On n'accepte donc QUE les chemins
  // du dossier de l'appelant — `getSignedUploadUrl` impose `${user.id}/...`. Tout autre
  // préfixe (ou `..`) est refusé. Pour une note texte, on ignore tout chemin fourni.
  let safeStoragePath: string | null = null;
  if (type === "audio") {
    if (
      !storagePath ||
      !storagePath.startsWith(`${user.id}/`) ||
      storagePath.includes("..")
    ) {
      console.error("[entries:createEntry] storage_path rejeté:", storagePath);
      redirect("/dashboard/capture?error=upload-invalide");
    }
    safeStoragePath = storagePath;
  }

  const { data: entry, error: insertError } = await supabase
    .from("entries")
    .insert({
      org_id: profile.org_id,
      user_id: user.id,
      type,
      raw_text: rawText,
      storage_path: safeStoragePath,
    })
    .select("id")
    .single();

  if (insertError || !entry) {
    console.error("[entries:createEntry] insert:", insertError?.message);
    redirect("/dashboard?error=create-failed");
  }

  // Pipeline IA ASYNCHRONE (audit UX niveau 2). On sort Whisper + Haiku du chemin
  // critique : l'entrée est créée avec processed_at=null, on rend la main tout de
  // suite, et `after()` lance le traitement APRÈS l'envoi de la réponse. L'utilisateur
  // ne subit plus la latence de transcription/extraction (ni les timeouts Vercel).
  // Vaut pour TOUTES les entrées : audio ET texte (sinon les notes écrites
  // n'apparaîtraient jamais dans Tâches → entrées fantômes).
  const entryId = entry.id as string;
  after(async () => {
    try {
      const result = await processEntry(entryId);
      if (result.error) {
        console.error("[entries:createEntry] pipeline:", result.error);
      }
    } catch (err) {
      console.error("[entries:createEntry] pipeline unexpected:", err);
    }
  });

  revalidatePath("/dashboard");
  // On renvoie vers Tâches : l'utilisateur voit l'état « traitement en cours » se
  // résoudre en tâches proposées (machine à états lisible — brand guide §5).
  redirect("/dashboard/tasks?processing=1");
}
