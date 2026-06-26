import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inviteOne, loadInviteContext } from "@/lib/invitations/service";

// ── POST /api/invites/send ──────────────────────────────────────────────────
// Émet une invitation pour l'org de l'admin courant. Le jeton (UUID v4) est
// généré par la base (default gen_random_uuid()), jamais par le client. L'écriture
// passe par la SESSION (RLS) : la policy invitations_insert_admin verrouille
// org_id = current_org_id(), created_by = auth.uid() et le rôle 'admin'.
// La logique « créer + envoyer » est factorisée dans lib/invitations/service.ts
// (inviteOne) — partagée avec l'onboarding. Comportement client INCHANGÉ :
// mêmes codes HTTP et même JSON { link, email, expiresAt, emailSent }.
export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth + rôle admin + nom de l'org (mêmes messages/codes que l'ancienne route).
  const loaded = await loadInviteContext(supabase);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await inviteOne(supabase, loaded.ctx, String(body.email ?? ""));

  if (result.status === "invalid") {
    return NextResponse.json(
      { error: "Entrez une adresse e-mail valide." },
      { status: 400 },
    );
  }
  if (result.status === "already_member") {
    return NextResponse.json(
      { error: "Cette personne fait déjà partie de l'équipe." },
      { status: 409 },
    );
  }
  if (result.status === "error") {
    return NextResponse.json(
      { error: "L'invitation n'a pas pu être créée." },
      { status: 500 },
    );
  }

  // "sent" ou "already_invited" (pending réutilisée) : dans les deux cas on
  // renvoie le lien, exactement comme l'ancienne route (200, même payload).
  return NextResponse.json({
    link: result.link,
    email: result.email,
    expiresAt: result.expiresAt,
    emailSent: result.emailSent,
  });
}
