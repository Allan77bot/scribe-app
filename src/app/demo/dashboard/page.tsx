"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ════════════════════════════════════════════════════════════════════════
// DÉMO — hub + GUIDE PREMIÈRE-FOIS (coachmarks) sur la barre de nav.
// À l'arrivée : voile sombre, chaque onglet s'allume à tour de rôle avec une
// bulle expliquant son rôle. Affiché une seule fois (localStorage) ; bouton
// « Revoir le guide » pour rejouer. État local seul. THROWAWAY (maquette).
// ════════════════════════════════════════════════════════════════════════

const TOUR_KEY = "scribe-demo-tour-seen";

type NavItem = {
  label: string;
  href?: string;
  explain: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  {
    label: "Accueil",
    href: "/demo/dashboard",
    explain:
      "Votre tableau de bord : météo des tâches, minutes restantes, dernière passation.",
    icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  },
  {
    label: "Capturer",
    href: "/demo/capture",
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

export default function DemoDashboard() {
  const [tourActive, setTourActive] = useState(false);
  const [idx, setIdx] = useState(0);

  // Première visite → on lance le guide automatiquement, après un court délai
  // (la page s'affiche, puis le guide apparaît en douceur). Le setState est
  // différé (hors corps synchrone de l'effet) → pas de cascade de rendus.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_KEY) === "true") return;
    const t = setTimeout(() => {
      setIdx(0);
      setTourActive(true);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const finish = () => {
    setTourActive(false);
    try {
      localStorage.setItem(TOUR_KEY, "true");
    } catch {}
  };
  const next = () => (idx < NAV.length - 1 ? setIdx((i) => i + 1) : finish());
  const replay = () => {
    try {
      localStorage.removeItem(TOUR_KEY);
    } catch {}
    setIdx(0);
    setTourActive(true);
  };

  return (
    <main className="relative mx-auto w-full max-w-md px-5 pb-28 pt-5">
      <style>{`
        @keyframes scribePulse { 0%,100%{ box-shadow:0 0 0 0 rgba(0,89,187,.45);} 50%{ box-shadow:0 0 0 8px rgba(0,89,187,0);} }
        .scribe-pulse { animation: scribePulse 1.6s ease-out infinite; }
        @keyframes scribePop { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
        .scribe-pop { animation: scribePop .28s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce){ .scribe-pulse,.scribe-pop{ animation:none; } }
      `}</style>

      {/* ── Contenu hub (allégé) ── */}
      <header className="mb-4">
        <p className="text-base font-semibold text-secondary">
          Atelier du Port — relais nuit
        </p>
        <p className="text-xs text-on-surface-variant">Allan · admin</p>
      </header>

      <Link
        href="/demo/capture"
        className="flex items-center justify-between rounded-card bg-primary p-5 text-on-primary shadow-card transition-all hover:bg-primary-container active:scale-[0.98]"
      >
        <div>
          <p className="text-base font-semibold">Capturer une note</p>
          <p className="mt-0.5 text-xs text-on-primary/80">
            Vocal ou écrit — Scribe en extrait les tâches
          </p>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="9" y="2.5" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      </Link>

      <section className="mt-4 rounded-card bg-card p-6 shadow-card">
        <h2 className="mb-3 text-sm font-medium text-secondary">Météo des tâches</h2>
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            ["À confirmer", "2", "text-secondary"],
            ["En cours", "5", "text-primary"],
            ["Terminées", "12", "text-on-surface"],
          ].map(([k, v, c]) => (
            <div key={k}>
              <dt className="text-xs text-on-surface-variant">{k}</dt>
              <dd className={`mt-1 text-2xl font-bold tabular-nums ${c}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!tourActive && (
        <button
          onClick={replay}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill bg-azure px-6 py-3 text-sm font-semibold text-primary transition-all hover:brightness-95"
        >
          ↺ Revoir le guide des onglets
        </button>
      )}

      {/* ── Voile du guide ── */}
      {tourActive && (
        <button
          aria-label="Passer le guide"
          onClick={finish}
          className="fixed inset-0 z-40 bg-secondary/70"
          style={{ backdropFilter: "blur(1px)" }}
        />
      )}

      {/* ── Bulle d'explication (au-dessus de la barre) ── */}
      {tourActive && (
        <div
          className="fixed inset-x-0 z-50 mx-auto max-w-md"
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom) + 16px)" }}
        >
          <div key={idx} className="scribe-pop relative mx-4 rounded-card bg-card p-4 shadow-modal">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {idx + 1} / {NAV.length} · {NAV[idx].label}
              </span>
              <button onClick={finish} className="text-xs text-outline hover:text-on-surface-variant">
                Passer
              </button>
            </div>
            <p className="mt-1.5 text-sm text-on-surface">{NAV[idx].explain}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5" aria-hidden>
                {NAV.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-pill transition-all ${i === idx ? "w-4 bg-primary" : "w-1.5 bg-surface-container"}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="flex h-10 items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
              >
                {idx < NAV.length - 1 ? "Suivant" : "Terminé"}
              </button>
            </div>
          </div>
          {/* Caret pointant vers l'onglet en cours */}
          <div
            className="absolute h-3 w-3 -translate-x-1/2 rotate-45 bg-card"
            style={{ left: `${((idx + 0.5) / NAV.length) * 100}%`, bottom: "-5px" }}
            aria-hidden
          />
        </div>
      )}

      {/* ── Barre de navigation (z élevé pendant le guide pour passer au-dessus du voile) ── */}
      <nav
        className={`fixed inset-x-0 bottom-0 bg-surface-container/95 shadow-card backdrop-blur ${tourActive ? "z-50" : "z-30"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex w-full max-w-md">
          {NAV.map((item, i) => {
            const lit = tourActive && i === idx;
            const dim = tourActive && i !== idx;
            const inner = (
              <span
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 transition-all ${
                  lit ? "text-primary" : "text-on-surface-variant"
                } ${dim ? "opacity-35" : "opacity-100"}`}
              >
                <span className={`grid size-9 place-items-center rounded-full ${lit ? "scribe-pulse bg-azure" : ""}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={lit ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {item.icon}
                  </svg>
                </span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </span>
            );
            return (
              <li key={item.label} className="flex-1">
                {item.href && !tourActive ? (
                  <Link href={item.href} className="block">
                    {inner}
                  </Link>
                ) : (
                  <span className="block">{inner}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </main>
  );
}
