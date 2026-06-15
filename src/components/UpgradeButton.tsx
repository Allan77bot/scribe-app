"use client";

import { useTransition, useState } from "react";
import { createCheckoutSession } from "@/lib/billing/actions";

// Bouton client : déclenche la session Stripe Checkout puis redirige vers Stripe.
// (Un Server Component ne peut pas utiliser window.location — d'où ce composant.)
export default function UpgradeButton({
  targetPlan,
  targetPlanName,
  price,
}: {
  targetPlan: string;
  targetPlanName: string;
  price: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(targetPlan);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        // Redirige le navigateur vers la page de paiement Stripe.
        window.location.href = result.url;
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="min-h-[44px] w-full rounded-xl py-3 text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-50"
        style={{ background: "var(--gradient-brand)" }}
      >
        {isPending ? "Redirection…" : `Passer à ${targetPlanName} — ${price}`}
      </button>
      {error && (
        <p className="text-center text-xs text-danger">Erreur : {error}</p>
      )}
    </div>
  );
}
