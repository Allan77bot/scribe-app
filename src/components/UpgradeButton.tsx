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
        className="w-full rounded-lg py-3 text-sm font-semibold min-h-[44px] disabled:opacity-40 transition-opacity"
        style={{ background: "#6E1F2C", color: "#F0E8D6" }}
      >
        {isPending ? "Redirection…" : `Passer à ${targetPlanName} — ${price}`}
      </button>
      {error && (
        <p className="text-xs text-center" style={{ color: "#6E1F2C" }}>
          Erreur : {error}
        </p>
      )}
    </div>
  );
}
