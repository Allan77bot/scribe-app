import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvitationEmail } from "@/lib/email/send";

// ── Helpers d'invitation partagés (API routes + server actions) ────────────
// Ce module n'expose PAS de server action ("use server" absent) : il regroupe la
// logique pure, l'écriture par SESSION (RLS) « créer + envoyer une invite », et
// les lectures service_role nécessaires à l'acceptation (hors RLS).

export const INVITE_TTL_HOURS = 72;

// Normalise une adresse pour la comparaison (l'e-mail est insensible à la casse
// côté domaine ; on traite tout en minuscules pour éviter les doublons).
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Validation légère côté serveur (le navigateur valide déjà type="email").
export function isValidEmail(email: string): boolean {
  const e = email.trim();
  return e.length >= 3 && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// URL publique du site pour bâtir le lien d'acceptation. NEXT_PUBLIC_SITE_URL
// n'est pas toujours défini sur Vercel → sans repli, les invitations pointaient
// vers http://localhost:3000. On retombe sur VERCEL_URL (injecté automatiquement
// par Vercel) avant le localhost de dev.
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

// Lien d'acceptation : jamais d'org_id en clair, seulement le jeton secret.
export function acceptUrl(token: string): string {
  return `${siteUrl()}/invite/accept?token=${token}`;
}

export type ValidInvitation = {
  id: string;
  orgId: string;
  email: string;
  orgName: string;
};

// Relit une invitation par jeton AVANT que l'invité soit membre (donc hors RLS,
// via service_role). Ne renvoie l'invitation que si elle est 'pending' et non
// expirée. Retourne null sinon (jeton inconnu, déjà accepté, révoqué, expiré).
export async function getValidInvitationByToken(
  token: string,
): Promise<ValidInvitation | null> {
  // Garde-fou : un jeton non-UUID ne peut pas exister → court-circuit.
  if (!/^[0-9a-f-]{36}$/i.test(token.trim())) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select("id, org_id, email, status, expires_at, organizations(name)")
    .eq("token", token.trim())
    .maybeSingle();

  if (error || !data) return null;
  if (data.status !== "pending") return null;
  if (new Date(data.expires_at).getTime() <= Date.now()) return null;

  // La jointure renvoie un objet (ou un tableau selon le typage) — on normalise.
  const org = Array.isArray(data.organizations)
    ? data.organizations[0]
    : data.organizations;

  return {
    id: data.id as string,
    orgId: data.org_id as string,
    email: data.email as string,
    orgName: (org?.name as string) ?? "votre équipe",
  };
}


// ── « Créer + envoyer une invite », factorisé (route API + onboarding) ──────
// Logique extraite de POST /api/invites/send pour être réutilisable depuis une
// server action (onboarding). Tout passe par la SESSION fournie (RLS) : la policy
// invitations_insert_admin verrouille org_id = current_org_id(), created_by =
// auth.uid() et le rôle 'admin'. AUCUN service_role ici (isolation org garantie
// par la RLS sur le client passé). Les garde-fous d'origine sont conservés :
// jeton généré par la DB, déjà-membre, invitation pending réutilisée, Brevo non
// bloquant.

export type InviteStatus =
  | "sent" // nouvelle invitation créée + e-mail (tenté) envoyé
  | "already_member" // la personne fait déjà partie de l'org
  | "already_invited" // invitation pending non expirée réutilisée (+ e-mail renvoyé)
  | "invalid" // adresse e-mail invalide
  | "error"; // échec d'insertion (table absente, RLS, etc.)

// Contexte de l'inviteur — résolu une fois, réutilisé pour chaque e-mail d'un lot.
export type InviteContext = {
  userId: string; // created_by (auth.uid())
  orgId: string; // org de l'inviteur (= current_org_id())
  orgName: string; // pour l'e-mail Brevo
  inviterName?: string | null; // display_name de l'inviteur (pour l'e-mail)
};

export type InviteResult =
  | { status: "sent"; email: string; link: string; expiresAt: string; emailSent: boolean }
  | {
      status: "already_invited";
      email: string;
      link: string;
      expiresAt: string;
      emailSent: boolean;
    }
  | { status: "already_member"; email: string }
  | { status: "invalid"; email: string }
  | { status: "error"; email: string };

// Charge et vérifie le contexte de l'inviteur depuis la SESSION. Renvoie soit le
// contexte, soit une erreur HTTP prête à servir (mêmes messages/codes que la route
// d'origine). ADMIN ONLY : seul un admin de l'org peut émettre des invitations.
export async function loadInviteContext(
  supabase: SupabaseClient,
): Promise<{ ctx: InviteContext } | { error: string; status: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Non authentifié.", status: 401 };
  }

  // Profil : on a besoin du rôle (admin) et du nom de l'org pour l'e-mail.
  const { data: profile } = await supabase
    .from("users")
    .select("role, display_name, organizations(name), org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return { error: "Réservé aux administrateurs de l'équipe.", status: 403 };
  }

  const rawOrg = (
    profile as unknown as {
      organizations?: { name: string } | { name: string }[];
    }
  ).organizations;
  const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;

  return {
    ctx: {
      userId: user.id,
      orgId: (profile as unknown as { org_id: string }).org_id,
      orgName: org?.name ?? "votre équipe",
      inviterName:
        (profile as unknown as { display_name: string | null }).display_name ?? null,
    },
  };
}

// Crée (ou réutilise) une invitation pour `rawEmail` et envoie l'e-mail Brevo.
// `supabase` doit être un client de SESSION (la RLS fait l'isolation) ; `ctx`
// provient de loadInviteContext (admin vérifié). Idempotent côté UX : une
// invitation pending non expirée est réutilisée plutôt que dupliquée.
export async function inviteOne(
  supabase: SupabaseClient,
  ctx: InviteContext,
  rawEmail: string,
): Promise<InviteResult> {
  if (!isValidEmail(rawEmail)) {
    return { status: "invalid", email: rawEmail.trim().toLowerCase() };
  }
  const email = normalizeEmail(rawEmail);

  // Garde-fou : on n'invite pas un membre déjà présent dans l'org. La RLS
  // (users_select_same_org) restreint déjà cette lecture à NOTRE org.
  const { data: existingMember } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingMember) {
    return { status: "already_member", email };
  }

  // Invitation en attente non expirée déjà émise → on la réutilise (même lien à
  // repartager) plutôt que d'en empiler une seconde.
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
  let reused = false;

  if (pending) {
    token = pending.token as string;
    expiresAt = pending.expires_at as string;
    reused = true;
  } else {
    // token + expires_at posés par les defaults de la table (UUID v4, +72 h).
    const { data: inserted, error } = await supabase
      .from("invitations")
      .insert({ email, created_by: ctx.userId, org_id: ctx.orgId })
      .select("token, expires_at")
      .single();

    if (error || !inserted) {
      // Diagnostic complet en log : `42P01` = table invitations absente (0007
      // non appliquée) ; `42501`/RLS = policy invitations_insert_admin.
      console.error("[invites:inviteOne] insert", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });
      return { status: "error", email };
    }
    token = inserted.token as string;
    expiresAt = inserted.expires_at as string;
  }

  const link = acceptUrl(token);

  // Envoi Brevo NON bloquant : si l'e-mail échoue, l'inviteur garde le lien à copier.
  let emailSent = true;
  try {
    await sendInvitationEmail(email, ctx.orgName, link, ctx.inviterName || undefined);
  } catch (err) {
    emailSent = false;
    console.error(
      "[invites:inviteOne] email",
      err instanceof Error ? err.message : String(err),
    );
  }

  return reused
    ? { status: "already_invited", email, link, expiresAt, emailSent }
    : { status: "sent", email, link, expiresAt, emailSent };
}
