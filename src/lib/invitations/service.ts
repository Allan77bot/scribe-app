import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Helpers d'invitation partagés (API routes + server actions) ────────────
// Ce module n'expose PAS de server action ("use server" absent) : il regroupe la
// logique pure et les lectures service_role nécessaires à l'acceptation, hors RLS.

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
