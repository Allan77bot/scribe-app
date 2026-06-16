import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/user/avatar/upload — reçoit un fichier image, l'upload dans le
// bucket `avatars` via le client session (RLS storage), puis met à jour
// users.avatar_url.
//
// N'utilise PLUS le client service_role : la clé SUPABASE_SERVICE_ROLE_KEY
// est tronquée sur Vercel (bug Hermes > 200 chars) et rend le JWT invalide.
// Les politiques RLS storage permettent à un user auth d'écrire dans son
// propre dossier {uid}/ — c'est plus sûr et sans dépendance admin.

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

    // Stockage via la session utilisateur (pas service_role). Le fichier va
    // dans {user.id}/avatar.{ext} — les politiques RLS storage limitent
    // l'écriture à son propre dossier.
    const path = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("[avatar:upload]", uploadError.message);

      // Si l'upload RLS échoue (politiques storage manquantes), on tente
      // l'upload direct via REST API avec le token de session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const restUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/${path}`;
        const restRes = await fetch(restUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            "Content-Type": file.type,
            "x-upsert": "true",
          },
          body: buffer,
        });
        if (!restRes.ok) {
          const body = await restRes.text();
          console.error("[avatar:rest-fallback]", body);
          return NextResponse.json(
            { error: "L'envoi a échoué. Réessaie." },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "L'envoi a échoué. Réessaie." },
          { status: 500 },
        );
      }
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: bustedUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[avatar:update]", updateError.message);
      return NextResponse.json({ avatarUrl: bustedUrl, persisted: false });
    }

    return NextResponse.json({ avatarUrl: bustedUrl, persisted: true });
  } catch (err) {
    console.error("[avatar:unexpected]", err);
    return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
  }
}
