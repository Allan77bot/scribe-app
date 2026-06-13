"use server";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

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

// Insère une entrée (audio ou texte) dans la table entries.
// La RLS garantit que l'insertion respecte l'isolation par org.
export async function createEntry(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const storage_path = formData.get("storage_path")
    ? String(formData.get("storage_path"))
    : null;
  const raw_text = formData.get("raw_text")
    ? String(formData.get("raw_text"))
    : null;

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Récupère l'org_id du profil (RLS garantit qu'on lit le bon profil).
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { error } = await supabase.from("entries").insert({
    type,
    storage_path,
    raw_text,
    user_id: user.id,
    org_id: profile.org_id,
  });

  if (error) throw new Error(error.message);

  redirect("/dashboard/tasks");
}
