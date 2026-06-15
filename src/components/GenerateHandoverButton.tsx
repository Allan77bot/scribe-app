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
        className="min-h-[44px] w-full rounded-xl py-3 text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-50"
        style={{ background: "var(--gradient-brand)" }}
      >
        {isPending ? "Génération en cours…" : "Générer la passation"}
      </button>
      {error && <p className="text-center text-xs text-danger">Erreur : {error}</p>}
    </div>
  );
}
