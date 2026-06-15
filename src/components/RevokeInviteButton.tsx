"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeInvitation } from "@/lib/invitations/actions";

// Annule une invitation en attente (admin). Confirmation en deux temps pour
// éviter la révocation accidentelle, sans modale lourde.
export default function RevokeInviteButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function revoke() {
    startTransition(async () => {
      const res = await revokeInvitation(invitationId);
      if (!res.error) router.refresh();
      setArmed(false);
    });
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="shrink-0 rounded-pill px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:text-error"
      >
        Annuler
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={revoke}
      disabled={isPending}
      className="shrink-0 rounded-pill bg-error-container px-2.5 py-1.5 text-xs font-semibold text-on-error-container transition-opacity disabled:opacity-50"
    >
      {isPending ? "…" : "Confirmer"}
    </button>
  );
}
