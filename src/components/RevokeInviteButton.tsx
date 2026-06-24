"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeInvitation } from "@/lib/invitations/actions";
import { Button } from "@/components/ui/Button";

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

  // Repos : action discrète (text). Une fois armée : danger pour confirmer.
  if (!armed) {
    return (
      <Button
        type="button"
        variant="text"
        size="md"
        className="shrink-0 px-3"
        onClick={() => setArmed(true)}
      >
        Révoquer
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="md"
      className="shrink-0 px-3"
      onClick={revoke}
      disabled={isPending}
    >
      {isPending ? "…" : "Confirmer"}
    </Button>
  );
}
