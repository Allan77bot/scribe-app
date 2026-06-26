"use client";

import { replayNavGuide } from "@/components/FirstRunNavGuide";

// Bouton « Revoir le guide des onglets » — relance le coachmark de navigation
// (FirstRunNavGuide, monté dans le layout du dashboard). replayNavGuide() efface
// la clé localStorage « vu » puis émet l'évènement de rejeu : comme le guide vit
// dans le layout, il est présent sur la page Réglages et se relance EN PLACE.
export default function ReplayGuideButton() {
  return (
    <button
      type="button"
      onClick={replayNavGuide}
      className="flex h-12 w-full items-center justify-center rounded-pill bg-azure px-6 text-sm font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
    >
      Revoir le guide des onglets
    </button>
  );
}
