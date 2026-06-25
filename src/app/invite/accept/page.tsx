import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getValidInvitationByToken } from "@/lib/invitations/service";
import AcceptInviteForm from "@/components/AcceptInviteForm";
import { Logo } from "@/components/Logo";

// Page publique d'acceptation : /invite/accept?token=xxx
// Jamais d'org_id en URL — seulement le jeton secret. On le valide côté serveur
// (service_role, hors RLS car l'invité n'est pas encore membre) avant d'afficher
// quoi que ce soit. L'e-mail est verrouillé sur celui de l'invitation.

// Coquille marine commune aux états de cette page (on est « dans » Scribe).
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-surface px-5 py-10 text-on-surface">
      <div className="w-full max-w-sm">
        <Logo size={36} className="mb-6 justify-center" />
        {children}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-card p-6 shadow-card">
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
          <h1 className="text-lg font-semibold text-secondary">
            Invitation introuvable
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Ce lien d&apos;invitation n&apos;est plus valide — il a peut-être
            expiré (72 h) ou déjà été utilisé. Demandez à l&apos;équipe de
            vous en renvoyer un.
          </p>
          <Link
            href="/signup"
            className="mt-5 flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            Créer ma propre équipe
          </Link>
          <Link
            href="/login"
            className="mt-3 block text-center text-sm font-medium text-primary"
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
          <h1 className="text-lg font-semibold text-secondary">
            Vous êtes déjà connecté
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pour rejoindre « {invite.orgName} » avec l&apos;adresse {invite.email},
            déconnectez-vous d&apos;abord, puis rouvrez ce lien.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
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
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Invitation
        </p>
        <h1 className="mt-1 text-xl font-bold text-secondary">
          Rejoignez « {invite.orgName} »
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Créez votre accès pour coordonner les tâches, les accusés de lecture et la
          passation avec votre équipe.
        </p>

        {error && (
          <p className="mt-4 rounded-field bg-error-container px-3 py-2 text-sm text-on-error-container">
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
