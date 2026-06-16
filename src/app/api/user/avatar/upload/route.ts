import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/user/avatar/upload — reçoit un fichier image (FormData), l'envoie
// dans le bucket `avatars` au chemin {uid}/avatar.{ext}, puis met à jour
// users.avatar_url. L'identité est vérifiée par la SESSION ; le bucket DOIT
// exister (créé manuellement ou via migration 0010).
//
// TOUT passe par la session RLS — pas de service_role. Plus robuste en prod.

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image trop lourde (5 Mo max)." }, { status: 400 });
    }
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Format non supporté. JPG, PNG, WebP ou GIF." }, { status: 400 });
    }

    // Stockage sous {uid}/avatar.{ext} — isolation par user, pas par org.
    // upsert écrase la précédente photo du même format.
    const path = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("[avatar:upload]", uploadError.message);
      return NextResponse.json(
        { error: "L'envoi a échoué. Vérifie que le bucket avatars existe dans Supabase Storage." },
        { status: 500 },
      );
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: bustedUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[avatar:update]", updateError.message);
      // Photo stockée mais pas persistée dans le profil — on prévient
      return NextResponse.json({ avatarUrl: bustedUrl, persisted: false });
    }

    return NextResponse.json({ avatarUrl: bustedUrl, persisted: true });
  } catch (err) {
    console.error("[avatar:unexpected]", err);
    return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
  }
}
