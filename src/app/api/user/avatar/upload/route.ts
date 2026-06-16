import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/user/avatar/upload — reçoit un fichier image (FormData), l'envoie
// dans le bucket public `avatars` au chemin {uid}/avatar.<ext>, puis met à jour
// users.avatar_url. Tout passe par le client de SESSION (clé anon) : la RLS
// Storage (policy avatars_owner_insert) garantit qu'on n'écrit que dans son
// propre dossier, et users_update_self qu'on ne modifie que son profil.

const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo — aligné sur le bucket
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image trop lourde (5 Mo maximum)." },
      { status: 400 },
    );
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Format non supporté. Utilise JPG, PNG, WebP ou GIF." },
      { status: 400 },
    );
  }

  // Chemin verrouillé sur l'uid (exigé par la policy d'écriture). upsert : on
  // écrase la photo précédente du même format.
  const path = `${user.id}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[avatar:upload]", uploadError.message);
    return NextResponse.json(
      { error: "L'envoi de la photo a échoué. Réessaie." },
      { status: 500 },
    );
  }

  // URL publique + anti-cache (le chemin est stable, le navigateur le mettrait
  // en cache sinon et garderait l'ancienne photo).
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  const bustedUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: bustedUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("[avatar:update]", updateError.message);
    return NextResponse.json(
      { error: "Photo envoyée mais profil non mis à jour." },
      { status: 500 },
    );
  }

  return NextResponse.json({ avatarUrl: bustedUrl });
}
