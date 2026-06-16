import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email/send";
import {
  acceptUrl,
  isValidEmail,
  normalizeEmail,
} from "@/lib/invitations/service";

// ── POST /api/invites/send ──────────────────────────────────────────────────
// Émet une invitation pour l'org de l'admin courant. Le jeton (UUID v4) est
// généré par la base (default gen_random_uuid()), jamais par le client. L'écriture
// passe par la SESSION (RLS) : la policy invitations_insert_admin verrouille
// org_id = current_org_id(), created_by = auth.uid() et le rôle 'admin'.
// Retourne le lien d'acceptation (copiable même si l'e-mail échoue).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Profil : on a besoin du rôle (admin) et du nom de l'org pour l'e-mail.
  const { data: profile } = await supabase
    .from("users")
    .select("role, display_name, organizations(name), org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Réservé aux administrateurs de l'équipe." },
      { status: 403 },
    );
  }

  const rawOrg = (profile as unknown as {
    organizations?: { name: string } | { name: string }[];
  }).organizations;
  const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
  const orgName = org?.name ?? "votre équipe";

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const rawEmail = String(body.email ?? "");
  if (!isValidEmail(rawEmail)) {
    return NextResponse.json(
      { error: "Entre une adresse e-mail valide." },
      { status: 400 },
    );
  }
  const email = normalizeEmail(rawEmail);

  // Garde-fou : on n'invite pas un membre déjà présent dans l'org.
  const { data: existingMember } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingMember) {
    return NextResponse.json(
      { error: "Cette personne fait déjà partie de l'équipe." },
      { status: 409 },
    );
  }

  // Si une invitation en attente non expirée existe déjà, on la renvoie plutôt
  // que d'en empiler une seconde (l'admin obtient le même lien à repartager).
  const nowIso = new Date().toISOString();
  const { data: pending } = await supabase
    .from("invitations")
    .select("token, expires_at")
    .eq("email", email)
    .eq("status", "pending")
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .maybeSingle();

  let token: string;
  let expiresAt: string;

  if (pending) {
    token = pending.token as string;
    expiresAt = pending.expires_at as string;
  } else {
    // token + expires_at posés par les defaults de la table (UUID v4, +72 h).
    const { data: inserted, error } = await supabase
      .from("invitations")
      .insert({ email, created_by: user.id, org_id: profile.org_id })
      .select("token, expires_at")
      .single();

    if (error || !inserted) {
      // Diagnostic complet en log : code PostgREST + détail. `42P01` = table
      // invitations absente (migration 0007 non appliquée) ; `42501`/RLS = policy
      // invitations_insert_admin. Le message client reste générique.
      console.error("[invites:send] insert", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });
      return NextResponse.json(
        { error: "L'invitation n'a pas pu être créée." },
        { status: 500 },
      );
    }
    token = inserted.token as string;
    expiresAt = inserted.expires_at as string;
  }

  const link = acceptUrl(token);

  // Envoi Brevo non bloquant : si l'e-mail échoue, l'admin garde le lien à copier.
  let emailSent = true;
  try {
    await sendInvitationEmail(email, orgName, link, profile.display_name || undefined);
  } catch (err) {
    emailSent = false;
    console.error(
      "[invites:send] email",
      err instanceof Error ? err.message : String(err),
    );
  }

  return NextResponse.json({ link, email, expiresAt, emailSent });
}
