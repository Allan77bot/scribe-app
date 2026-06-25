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
        className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Redirection…" : `Passer à ${targetPlanName} — ${price}`}
      </button>
      {error && (
        <p className="text-center text-xs text-error">Erreur : {error}</p>
      )}
    </div>
  );
}
