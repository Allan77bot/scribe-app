import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/user/avatar/upload — upload de photo de profil.
//
// Méthode : fetch direct vers l'API REST Supabase avec la clé service_role.
// Plus fiable que le client JS (pas de RLS storage à configurer, pas de
// dépendance aux policies bucket). La clé est le JWT service_role stocké
// dans SUPABASE_SERVICE_ROLE_KEY sur Vercel.

const MAX_BYTES = 5 * 1024 * 1024;

// FAILLE AS-20 : détermine le VRAI type d'image d'après les magic bytes (le Content-Type
// déclaré par le client est spoofable). Renvoie null pour tout ce qui n'est pas une image
// raster supportée — ce qui REFUSE notamment les SVG (vecteur d'XSS) et le HTML déguisé.
function sniffImageType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  // JPEG : FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  // GIF : "GIF8" (87a / 89a)
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return { ext: "gif", mime: "image/gif" };
  }
  // WebP : "RIFF"...."WEBP"
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

async function ensureBucket(baseUrl: string, key: string): Promise<void> {
  // Crée le bucket avatars s'il n'existe pas (idempotent).
  const url = `${baseUrl}/storage/v1/bucket`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "avatars",
      name: "avatars",
      public: true,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }),
  });
  // 409 = already exists → OK. Tout autre code = log mais on continue.
  if (!res.ok && res.status !== 409) {
    console.error("[avatar:bucket]", await res.text());
  }
}

export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: "Image trop lourde (5 Mo max)." }, { status: 400 });
    }
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!baseUrl || !key) {
      console.error("[avatar] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 },
      );
    }

    // FAILLE AS-20 : on ne se fie PAS au Content-Type déclaré. On lit le contenu et on
    // sniffe les magic bytes → vrai type. SVG / HTML déguisé / fichier non-image = refusés.
    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffImageType(buffer);
    if (!sniffed) {
      return NextResponse.json(
        { error: "Format non supporté ou image invalide. JPG, PNG, WebP ou GIF." },
        { status: 400 },
      );
    }

    // Crée le bucket si absent (idempotent).
    await ensureBucket(baseUrl, key);

    const path = `${user.id}/avatar.${sniffed.ext}`;

    // Upload via REST API + service_role (pas de RLS storage).
    const uploadUrl = `${baseUrl}/storage/v1/object/avatars/${path}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": sniffed.mime,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const body = await uploadRes.text();
      console.error("[avatar:upload]", uploadRes.status, body.slice(0, 300));
      return NextResponse.json(
        { error: "L'envoi a échoué. Réessayez." },
        { status: 500 },
      );
    }

    // URL publique (bucket public).
    const publicUrl = `${baseUrl}/storage/v1/object/public/avatars/${path}`;
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    // Met à jour users.avatar_url via la session RLS.
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: bustedUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[avatar:update]", updateError.message);
      // L'image est uploadée mais le profil pas mis à jour — on retourne
      // l'URL pour que le front puisse réessayer.
      return NextResponse.json({ avatarUrl: bustedUrl, persisted: false });
    }

    return NextResponse.json({ avatarUrl: bustedUrl, persisted: true });
  } catch (err) {
    console.error("[avatar:unexpected]", err);
    return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
  }
}
