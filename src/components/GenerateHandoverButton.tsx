"use client";

import { useTransition, useState } from "react";
import { generateHandover } from "@/lib/handover/actions";

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
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Génération en cours…" : "Générer la passation"}
      </button>
      {error && (
        <p className="rounded-field bg-error-container px-4 py-2 text-center text-xs text-on-error-container">
          Erreur : {error}
        </p>
      )}
    </div>
  );
}
