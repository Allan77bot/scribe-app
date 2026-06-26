"use client";

import { useState, type ReactNode } from "react";

// ════════════════════════════════════════════════════════════════════════
// OnboardingTour — mini-tour partagé (manager + employé), 3 cartes animées :
//   Capturer → Tâches → Passation.
// Porté fidèlement de la maquette validée (src/app/demo/onboarding/page.tsx,
// étape step===2). Animation CSS pure (pas de librairie), prefers-reduced-motion
// respecté. Le composant ne rend QUE le contenu du tour ; le wizard parent
// fournit la carte (rounded-card bg-card p-6 shadow-card).
//
// Tous les chemins de sortie (« J'ai compris » sur la dernière carte, et
// « Passer la découverte ») appellent onDone(). « Suivant » avance d'une carte.
// ════════════════════════════════════════════════════════════════════════

type Slide = {
  title: string;
  line: string;
  icon: ReactNode;
};

const TOUR: Slide[] = [
  {
    title: "Capturer",
    line: "Dictez ou écrivez une note. Scribe en extrait les tâches tout seul.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="9" y="2.5" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    ),
  },
  {
    title: "Tâches",
    line: "L'IA propose, vous validez d'un tap. Rien ne s'escalade sans votre accord.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.2 2.2L15.5 9.5" />
      </svg>
    ),
  },
  {
    title: "Passation",
    line: "En fin de shift, un rapport part à l'équipe suivante — vous voyez qui l'a lu.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 8h12M12 4l4 4-4 4" />
        <path d="M20 16H8M12 20l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [tour, setTour] = useState(0);
  const isLast = tour === TOUR.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @keyframes scribeTourIn { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform:none; } }
        .scribe-tour-in { animation: scribeTourIn .32s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .scribe-tour-in { animation: none; } }
      `}</style>

      {/* Carte courante — re-montée à chaque changement (key) pour rejouer l'anim */}
      <div
        key={tour}
        className="scribe-tour-in flex flex-col items-center gap-4 py-2 text-center"
      >
        <div className="grid size-16 place-items-center rounded-card bg-azure text-primary">
          {TOUR[tour].icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary">{TOUR[tour].title}</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-on-surface-variant">
            {TOUR[tour].line}
          </p>
        </div>
      </div>

      {/* Points de navigation — cliquables, zone de tap ≥ 44px (h-11 transparent) */}
      <div className="flex items-center justify-center gap-1">
        {TOUR.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setTour(i)}
            aria-label={`Aller à « ${slide.title} »`}
            aria-current={i === tour ? "true" : undefined}
            className="grid h-11 w-11 place-items-center"
          >
            <span
              className={`h-2 rounded-pill transition-all ${
                i === tour ? "w-6 bg-primary" : "w-2 bg-surface-container"
              }`}
            />
          </button>
        ))}
      </div>

      {/* CTA principal : « Suivant » jusqu'à la dernière, puis « J'ai compris » */}
      <button
        type="button"
        onClick={() => (isLast ? onDone() : setTour((t) => t + 1))}
        className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
      >
        {isLast ? "J'ai compris" : "Suivant"}
      </button>

      {/* Skip discret — sort du tour immédiatement */}
      <button
        type="button"
        onClick={onDone}
        className="min-h-[44px] text-center text-xs text-outline transition-colors hover:text-on-surface-variant"
      >
        Passer la découverte
      </button>
    </div>
  );
}
