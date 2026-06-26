"use client";

import { useState } from "react";
import { MEMBER_COLORS, textColorOn } from "@/lib/avatar";

// Sélecteur de couleur de membre. Les teintes déjà prises par d'autres membres
// de l'org sont désactivées (FEATURE 2 : une couleur = un membre). La valeur
// choisie alimente un <input hidden name="color"> soumis avec le profil.

type Props = {
  current: string | null;
  // Couleurs occupées par les AUTRES membres (la mienne reste sélectionnable).
  taken: string[];
};

export default function ColorPicker({ current, taken }: Props) {
  const [selected, setSelected] = useState<string | null>(current);
  const takenSet = new Set(taken);

  return (
    <div>
      <input type="hidden" name="color" value={selected ?? ""} />
      <div className="flex flex-wrap gap-3">
        {MEMBER_COLORS.map((color) => {
          const isTaken = takenSet.has(color) && color !== current;
          const isSelected = selected === color;
          return (
            <button
              key={color}
              type="button"
              disabled={isTaken}
              onClick={() => setSelected(color)}
              aria-label={isTaken ? "Couleur déjà prise" : "Choisir cette couleur"}
              aria-pressed={isSelected}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                backgroundColor: color,
                boxShadow: isSelected ? "0 0 0 2px #002b5b" : undefined,
              }}
            >
              {isSelected && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={textColorOn(color)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
              {isTaken && !isSelected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textColorOn(color)} strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
