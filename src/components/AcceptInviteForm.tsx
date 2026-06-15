"use client";

import { useFormStatus } from "react-dom";
import { acceptInvitation } from "@/lib/invitations/actions";

// Formulaire d'acceptation d'invitation. L'e-mail est VERROUILLÉ sur celui de
// l'invitation (lecture seule + champ caché) : l'invité ne peut pas détourner le
// lien vers une autre adresse. Le jeton voyage en champ caché et est revalidé
// côté serveur par l'action puis par le trigger SQL.

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[48px] rounded-xl text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-40 bg-gradient-brand"
    >
      {pending ? "Création…" : "Rejoindre l'équipe"}
    </button>
  );
}

export default function AcceptInviteForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  return (
    <form action={acceptInvitation} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          E-mail invité
        </span>
        {/* Verrouillé : informatif, non modifiable. Champ caché pour l'envoi. */}
        <input
          type="email"
          value={email}
          readOnly
          aria-readonly="true"
          className="min-h-[48px] w-full cursor-not-allowed rounded-lg border border-ink-600 bg-ink-900 px-3.5 text-base text-muted outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Ton nom
        </span>
        <input
          type="text"
          name="display_name"
          autoComplete="name"
          maxLength={80}
          placeholder="Ex. Camille"
          className="min-h-[48px] w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 text-base text-cloud-50 outline-none transition-colors focus:border-accent-cyan"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Mot de passe
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="min-h-[48px] w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 text-base text-cloud-50 outline-none transition-colors focus:border-accent-cyan"
        />
      </label>

      <SubmitButton />
    </form>
  );
}
