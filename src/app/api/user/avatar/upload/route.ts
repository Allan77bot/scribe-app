import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";

// POST /api/user/avatar/upload — reçoit un fichier image (FormData), l'envoie
// dans le bucket public `avatars` au chemin {uid}/avatar.<ext>, puis met à jour
// users.avatar_url.
//
// L'identité est toujours vérifiée par la SESSION (getUser), mais l'écriture
// Storage passe par le client service_role : le chemin est verrouillé côté
// serveur sur {uid}/, donc la garantie d'isolation est identique à la policy
// avatars_owner_insert, SANS dépendre de la section Storage de la migration 0010
// (bucket + policies). On crée le bucket s'il manque → l'upload marche en prod
// même si 0010 n'a pas encore été appliquée. C'est le correctif du bug
// « L'envoi de la photo a échoué ».

const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo — aligné sur le bucket
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ALLOWED_MIME = Object.keys(ALLOWED);

// Client admin (service_role) — null si l'env est incomplète (on retombe alors
// sur le client de session + RLS Storage).
function adminClient() {
  try {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createAdminSupabase(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch {
    return null;
  }
}

// Garantit que le bucket public `avatars` existe (idempotent). Sans ça, un projet
// où la migration 0010 n'a pas été appliquée renvoie « Bucket not found » à l'upload.
async function ensureBucket(admin: NonNullable<ReturnType<typeof adminClient>>) {
  const { data } = await admin.storage.getBucket("avatars");
  if (data) return;
  await admin.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: ALLOWED_MIME,
  });
}

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

  // Chemin verrouillé sur l'uid : un membre n'écrase que SA photo. upsert : on
  // remplace la précédente du même format.
  const path = `${user.id}/avatar.${ext}`;

  // Convertit le fichier en Buffer — Supabase Storage attend un ArrayBuffer/Buffer
  // mais le File Next.js (Web API) peut ne pas être reconnu comme tel par le
  // client Supabase. arrayBuffer() garantit la compatibilité.
  const arrayBuf = await file.arrayBuffer();

  // Écriture Storage via admin si dispo (crée le bucket au besoin), sinon via la
  // session (RLS Storage). `storage` sert ensuite à construire l'URL publique.
  const admin = adminClient();
  const storage = admin ?? supabase;

  if (admin) {
    try {
      await ensureBucket(admin);
    } catch (err) {
      console.error("[avatar:bucket]", err instanceof Error ? err.message : err);
    }
  }

  const { error: uploadError } = await storage.storage
    .from("avatars")
    .upload(path, Buffer.from(arrayBuf), { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[avatar:upload]", uploadError.message);
    return NextResponse.json(
      { error: "L'envoi de la photo a échoué. Réessaie." },
      { status: 500 },
    );
  }

  // URL publique + anti-cache (le chemin est stable, le navigateur garderait
  // l'ancienne photo sinon).
  const {
    data: { publicUrl },
  } = storage.storage.from("avatars").getPublicUrl(path);
  const bustedUrl = `${publicUrl}?v=${Date.now()}`;

  // Mise à jour du profil via la SESSION (RLS users_update_self). Si la colonne
  // avatar_url manque (migration 0010 non appliquée), on ne renvoie PAS une
  // erreur bloquante : la photo est bien stockée, on signale juste qu'elle ne
  // persistera qu'après application de la migration.
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: bustedUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("[avatar:update]", updateError.message);
    return NextResponse.json({ avatarUrl: bustedUrl, persisted: false });
  }

  return NextResponse.json({ avatarUrl: bustedUrl, persisted: true });
}
