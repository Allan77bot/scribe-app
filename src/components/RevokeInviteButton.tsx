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
        className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-danger"
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
      className="shrink-0 rounded-md border border-danger px-2.5 py-1.5 text-xs font-semibold text-danger transition-opacity disabled:opacity-50"
    >
      {isPending ? "…" : "Confirmer"}
    </button>
  );
}
