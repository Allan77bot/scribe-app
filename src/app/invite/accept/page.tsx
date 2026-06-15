import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getValidInvitationByToken } from "@/lib/invitations/service";
import AcceptInviteForm from "@/components/AcceptInviteForm";

// Page publique d'acceptation : /invite/accept?token=xxx
// Jamais d'org_id en URL — seulement le jeton secret. On le valide côté serveur
// (service_role, hors RLS car l'invité n'est pas encore membre) avant d'afficher
// quoi que ce soit. L'e-mail est verrouillé sur celui de l'invitation.

// Coquille marine commune aux états de cette page (on est « dans » Scribe).
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden px-5 py-10 text-cloud-50"
      style={{ background: "var(--gradient-veil)" }}
    >
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-lg font-bold tracking-tight">Scribe</p>
        {children}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-800 p-6 shadow-card">
      {children}
    </div>
  );
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  // Jeton absent ou invalide/expiré → état honnête + porte de sortie.
  const invite = token ? await getValidInvitationByToken(token) : null;
  if (!invite) {
    return (
      <Shell>
        <Card>
          <h1 className="text-lg font-semibold text-cloud-50">
            Invitation introuvable
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ce lien d&apos;invitation n&apos;est plus valide — il a peut-être
            expiré (72 h) ou déjà été utilisé. Demande à l&apos;équipe de
            t&apos;en renvoyer un.
          </p>
          <Link
            href="/signup"
            className="mt-5 flex min-h-[48px] items-center justify-center rounded-xl text-sm font-semibold text-cloud-50 bg-gradient-brand"
          >
            Créer ma propre équipe
          </Link>
          <Link
            href="/login"
            className="mt-3 block text-center text-sm font-medium text-accent-cyan"
          >
            J&apos;ai déjà un compte
          </Link>
        </Card>
      </Shell>
    );
  }

  // Si quelqu'un est déjà connecté, l'inscription via ce lien créerait un
  // doublon : on l'oriente plutôt que d'échouer en silence.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return (
      <Shell>
        <Card>
          <h1 className="text-lg font-semibold text-cloud-50">
            Tu es déjà connecté
          </h1>
          <p className="mt-2 text-sm text-muted">
            Pour rejoindre « {invite.orgName} » avec l&apos;adresse {invite.email},
            déconnecte-toi d&apos;abord, puis rouvre ce lien.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 flex min-h-[48px] items-center justify-center rounded-xl text-sm font-semibold text-cloud-50 bg-gradient-brand"
          >
            Aller à mon tableau de bord
          </Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-cyan">
          Invitation
        </p>
        <h1 className="mt-1 text-xl font-bold text-cloud-50">
          Rejoins « {invite.orgName} »
        </h1>
        <p className="mt-1 text-sm text-muted">
          Crée ton accès pour coordonner les tâches, les accusés de lecture et la
          passation avec ton équipe.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5">
          <AcceptInviteForm token={token!} email={invite.email} />
        </div>
      </Card>
    </Shell>
  );
}
