import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InviteMemberButton from "@/components/InviteMemberButton";
import RevokeInviteButton from "@/components/RevokeInviteButton";
import Avatar from "@/components/Avatar";

// Page Équipe — qui fait partie de l'org, qui est attendu. C'est le « casting »
// de la coordination : sans coéquipiers, pas d'accusé de lecture ni de passation.
// Lecture par SESSION (RLS) : on ne voit jamais les membres d'une autre org.

type Member = {
  id: string;
  display_name: string;
  email: string;
  role: "admin" | "member";
  color: string | null;
  avatar_url: string | null;
};

type Invite = {
  id: string;
  email: string;
  expires_at: string;
};

// Échéance relative et honnête (« expire dans 2 j », « expire bientôt »).
function expiresIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expirée";
  const hours = Math.round(ms / 3_600_000);
  if (hours < 1) return "expire bientôt";
  if (hours < 24) return `expire dans ${hours} h`;
  const days = Math.round(hours / 24);
  return `expire dans ${days} j`;
}

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profil courant : rôle + org_id (pour savoir qui peut inviter).
  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = me?.role === "admin";

  // Membres de l'org (RLS : même org uniquement). Admins d'abord.
  const { data: membersRaw } = await supabase
    .from("users")
    .select("id, display_name, email, role, color, avatar_url")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });
  const members = (membersRaw ?? []) as Member[];

  // Invitations en attente (non expirées). Affichées à l'admin seulement.
  let pending: Invite[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("invitations")
      .select("id, email, expires_at")
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    pending = (data ?? []) as Invite[];
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <header className="border-b border-outline-variant px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight text-secondary">Équipe</h1>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {members.length} membre{members.length !== 1 ? "s" : ""}
          {pending.length > 0
            ? ` · ${pending.length} invitation${pending.length !== 1 ? "s" : ""} en attente`
            : ""}
        </p>
      </header>

      <div className="mx-auto w-full max-w-md px-5 py-6">
        {/* CTA d'invitation — réservé aux admins (la policy le verrouille côté base). */}
        {isAdmin && (
          <div className="mb-6">
            <InviteMemberButton />
          </div>
        )}

        {/* Membres */}
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Membres
        </h2>
        <ul className="flex flex-col gap-2">
          {members.map((m) => {
            const isMe = m.id === user.id;
            return (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-card bg-white p-3 shadow-card"
              >
                <Avatar
                  name={m.display_name}
                  email={m.email}
                  color={m.color}
                  avatarUrl={m.avatar_url}
                  isAdmin={m.role === "admin"}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {m.display_name || m.email.split("@")[0]}
                    {isMe && <span className="text-on-surface-variant"> · vous</span>}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">{m.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    m.role === "admin"
                      ? "bg-primary text-on-primary"
                      : "bg-azure text-primary"
                  }`}
                >
                  {m.role === "admin" ? "Admin" : "Membre"}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Invitations en attente — visibles par l'admin. */}
        {isAdmin && pending.length > 0 && (
          <>
            <h2 className="mb-3 mt-7 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Invitations en attente
            </h2>
            <ul className="flex flex-col gap-2">
              {pending.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center gap-3 rounded-card border border-dashed border-outline-variant bg-white p-3 shadow-card"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azure text-primary"
                    aria-hidden
                  >
                    {/* Signal en transit : enveloppe au trait cyan. */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">
                      {inv.email}
                    </p>
                    <p className="text-xs text-on-surface-variant">{expiresIn(inv.expires_at)}</p>
                  </div>
                  <RevokeInviteButton invitationId={inv.id} />
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Membre non-admin et seul : on explique sans frustrer. */}
        {!isAdmin && members.length === 1 && (
          <p className="mt-6 rounded-card bg-white p-4 text-sm text-on-surface-variant shadow-card">
            Seul un administrateur peut inviter de nouveaux coéquipiers.
          </p>
        )}
      </div>
    </main>
  );
}
