"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// Guide « première fois » de la barre de navigation (coachmarks).
//
// À la 1ʳᵉ arrivée sur le dashboard : voile sombre, puis chaque onglet de la
// barre basse s'allume à tour de rôle (pastille qui pulse + bulle explicative)
// pour les 6 onglets réels (Accueil · Capturer · Tâches · Passation · Équipe ·
// Profil), puis le guide se ferme. Affiché UNE SEULE FOIS (localStorage).
//
// Architecture : ce composant est monté dans `dashboard/layout.tsx`, en frère
// du vrai `DashboardNav` (qu'on ne modifie pas). Pour mettre un onglet en
// surbrillance sans toucher à la nav réelle, le guide dessine son PROPRE voile
// + sa propre copie visuelle de la barre (même gabarit : `max-w-md`,
// `min-h-[56px]`, safe-area), posée AU-DESSUS de la nav réelle (z-50). La nav
// réelle reste dessous, masquée par le voile ; la copie ne sert qu'à montrer.
//
// SSR-safe (Next 16) : on ne lit `localStorage` que dans un `useEffect`, jamais
// au rendu serveur (sinon mismatch d'hydratation). Au premier rendu (serveur
// ET client) `active = false` → le composant ne rend rien : aucun écart.
//
// Rejouer : on écoute l'évènement window `scribe:replay-nav-guide` ET on
// exporte l'utilitaire `replayNavGuide()`. Le bouton « Revoir le guide » des
// Réglages n'a qu'à l'appeler (voir les notes d'intégration). `prefers-
// reduced-motion` est respecté (animations neutralisées, surbrillance gardée).
// ════════════════════════════════════════════════════════════════════════

/** Clé de persistance « vu » (par appareil — acceptable pour un guide cosmétique). */
export const NAV_GUIDE_SEEN_KEY = "scribe_nav_guide_seen";

/** Évènement window qui (re)lance le guide depuis n'importe où (ex. Réglages). */
export const NAV_GUIDE_REPLAY_EVENT = "scribe:replay-nav-guide";

/**
 * Relance le guide des onglets depuis n'importe quel composant client (ex. le
 * bouton « Revoir le guide » des Réglages). Efface la clé « vu » puis émet
 * l'évènement écouté par le guide monté dans le layout. SSR-safe (no-op hors
 * navigateur).
 */
export function replayNavGuide() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NAV_GUIDE_SEEN_KEY);
  } catch {
    // localStorage indisponible (mode privé, quota) → on relance quand même.
  }
  window.dispatchEvent(new Event(NAV_GUIDE_REPLAY_EVENT));
}

type NavStep = {
  label: string;
  explain: string;
  icon: React.ReactNode;
};

// Les 6 onglets RÉELS (cf. `DashboardNav.tsx`), dans le même ordre. Icônes et
// libellés copiés à l'identique ; explications portées depuis la maquette
// validée `/demo/dashboard`. Copy au vous, français.
const STEPS: NavStep[] = [
  {
    label: "Accueil",
    explain:
      "Votre tableau de bord : météo des tâches, minutes restantes, dernière passation.",
    icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  },
  {
    label: "Capturer",
    explain:
      "Le cœur de Scribe : dictez ou écrivez une note, l'IA en extrait les tâches.",
    icon: (
      <>
        <rect x="9" y="2.5" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
  },
  {
    label: "Tâches",
    explain:
      "Validez d'un tap les tâches proposées. Rien ne s'escalade sans votre accord.",
    icon: (
      <>
        <path d="M9 5h11M9 12h11M9 19h11" />
        <path d="m3.5 4.8 1 1 1.5-1.8M3.5 11.8l1 1 1.5-1.8M3.5 18.8l1 1 1.5-1.8" />
      </>
    ),
  },
  {
    label: "Passation",
    explain:
      "Le rapport de relais pour l'équipe suivante — et vous voyez qui l'a lu.",
    icon: <path d="M3 8h13l-3-3M21 16H8l3 3" />,
  },
  {
    label: "Équipe",
    explain: "Vos membres et les invitations en attente.",
    icon: (
      <>
        <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
        <circle cx="10" cy="7.5" r="3" />
        <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.7a3 3 0 0 1 0 5.6" />
      </>
    ),
  },
  {
    label: "Profil",
    explain: "Votre photo, votre couleur, vos préférences et la déconnexion.",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="9.5" r="3.5" />
        <path d="M5.5 19a7.5 7.5 0 0 1 13 0" />
      </>
    ),
  },
];

export default function FirstRunNavGuide() {
  // `active = false` au premier rendu serveur ET client → aucun mismatch
  // d'hydratation. La lecture de `localStorage` se fait dans l'effet ci-dessous.
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const start = useCallback(() => {
    setIdx(0);
    setActive(true);
  }, []);

  // Première visite → lancement auto après un court délai (la page s'affiche,
  // puis le guide apparaît en douceur). Si déjà vu, on ne fait rien.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = localStorage.getItem(NAV_GUIDE_SEEN_KEY) === "true";
    } catch {
      // localStorage illisible → on évite d'imposer le guide (pas de boucle).
      seen = true;
    }
    if (seen) return;
    const t = setTimeout(start, 350);
    return () => clearTimeout(t);
  }, [start]);

  // « Revoir le guide » : on écoute l'évènement émis par `replayNavGuide()`.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onReplay = () => start();
    window.addEventListener(NAV_GUIDE_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(NAV_GUIDE_REPLAY_EVENT, onReplay);
  }, [start]);

  const finish = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(NAV_GUIDE_SEEN_KEY, "true");
    } catch {
      // Pas de persistance possible → le guide repassera, sans danger.
    }
  }, []);

  const next = useCallback(() => {
    setIdx((i) => {
      if (i < STEPS.length - 1) return i + 1;
      finish();
      return i;
    });
  }, [finish]);

  // Fermeture au clavier (Échap) tant que le guide est ouvert.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  // A11y : à l'ouverture, on place le focus clavier sur le CTA (la modale n'est
  // plus une zone morte pour la navigation au clavier).
  useEffect(() => {
    if (active) ctaRef.current?.focus();
  }, [active]);

  if (!active) return null;

  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  return (
    <div role="dialog" aria-modal="true" aria-label="Guide des onglets">
      {/* Keyframes scopées (préfixe frg-) pour ne rien percuter ailleurs.
          La media-query reduce neutralise tout (double sécurité avec globals). */}
      <style>{`
        @keyframes frgPulse { 0%,100%{ box-shadow:0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent);} 50%{ box-shadow:0 0 0 8px transparent;} }
        .frg-pulse { animation: frgPulse 1.6s ease-out infinite; }
        @keyframes frgPop { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
        .frg-pop { animation: frgPop .28s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce){ .frg-pulse,.frg-pop{ animation:none; } }
      `}</style>

      {/* ── Voile sombre (couvre tout, nav réelle comprise). Tap = passer. ── */}
      <button
        type="button"
        aria-label="Passer le guide"
        onClick={finish}
        className="fixed inset-0 z-[60] bg-secondary/70"
        style={{ backdropFilter: "blur(1px)" }}
      />

      {/* ── Bulle d'explication, posée au-dessus de la barre. ── */}
      <div
        className="fixed inset-x-0 z-[70] mx-auto max-w-md"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 16px)" }}
      >
        <div
          key={idx}
          className="frg-pop relative mx-4 rounded-card bg-card p-4 shadow-modal"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {idx + 1} / {STEPS.length} · {step.label}
            </span>
            <button
              type="button"
              onClick={finish}
              className="-m-2 flex min-h-[44px] min-w-[44px] items-center justify-end p-2 text-xs text-outline transition-colors hover:text-on-surface-variant"
            >
              Passer
            </button>
          </div>
          <p className="mt-1.5 text-sm text-on-surface" aria-live="polite">
            {step.explain}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-pill transition-all ${
                    i === idx ? "w-4 bg-primary" : "w-1.5 bg-surface-container"
                  }`}
                />
              ))}
            </div>
            <button
              ref={ctaRef}
              type="button"
              onClick={next}
              className="flex min-h-[44px] items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              {isLast ? "Terminé" : "Suivant"}
            </button>
          </div>
        </div>
        {/* Caret pointant vers l'onglet en cours (centré sur sa colonne). */}
        <div
          className="absolute h-3 w-3 -translate-x-1/2 rotate-45 bg-card"
          style={{
            left: `${((idx + 0.5) / STEPS.length) * 100}%`,
            bottom: "-5px",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ── Copie visuelle de la barre (au-dessus de la nav réelle, z-50).
             Mêmes gabarits que `DashboardNav` pour un calque pixel-aligné.
             Purement décoratif : aucune navigation pendant le guide. ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-line bg-card/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-hidden="true"
      >
        <ul className="mx-auto flex w-full max-w-md">
          {STEPS.map((item, i) => {
            const lit = i === idx;
            return (
              <li key={item.label} className="flex-1">
                <span
                  className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 transition-all ${
                    lit ? "text-primary opacity-100" : "text-on-surface-variant opacity-35"
                  }`}
                >
                  <span
                    className={`grid size-9 place-items-center rounded-full ${
                      lit ? "frg-pulse bg-azure" : ""
                    }`}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={lit ? 2 : 1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {item.icon}
                    </svg>
                  </span>
                  <span className="text-[10px] font-medium leading-none">
                    {item.label}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
