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
      className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
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
        <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          E-mail invité
        </span>
        {/* Verrouillé : informatif, non modifiable. Champ caché pour l'envoi. */}
        <input
          type="email"
          value={email}
          readOnly
          aria-readonly="true"
          className="w-full cursor-not-allowed rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface-variant focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Votre nom
        </span>
        <input
          type="text"
          name="display_name"
          autoComplete="name"
          maxLength={80}
          placeholder="Ex. Camille"
          className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Mot de passe
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <SubmitButton />
    </form>
  );
}
