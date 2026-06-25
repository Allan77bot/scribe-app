"use client";

import { useTransition, useState } from "react";
import { generateHandover } from "@/lib/handover/actions";
import { Button } from "@/components/ui/Button";

export default function GenerateHandoverButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateHandover();
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Action principale du relais → Button DS size="lg" (≥56px, cible tactile terrain). */}
      <Button size="lg" fullWidth onClick={handleClick} disabled={isPending}>
        {isPending ? "Génération en cours…" : "Générer la passation"}
      </Button>
      {error && (
        <p className="rounded-field bg-error-container px-4 py-2 text-center text-xs text-on-error-container">
          Erreur : {error}
        </p>
      )}
    </div>
  );
}
