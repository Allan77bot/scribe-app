"use client";

import { useState } from "react";
import Link from "next/link";

// ════════════════════════════════════════════════════════════════════════
// DÉMO — MAQUETTE du NOUVEL onboarding (Approche ①, idée A), DEUX parcours :
//   • Manager (créateur) : Nommer l'équipe → Inviter → Mini-tour → Prêt.
//   • Employé (invité)    : Bienvenue (rejoint) → Profil (nom+couleur) → Mini-tour → Prêt.
// Toggle Manager/Employé pour voir les deux. État local seul. THROWAWAY.
// ════════════════════════════════════════════════════════════════════════

const PALETTE = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6", "#1ABC9C", "#E67E22", "#ECF0F1"];

const LABELS = {
  manager: ["Équipe", "Invitations", "Découverte", "Prêt"],
  employe: ["Bienvenue", "Profil", "Découverte", "Prêt"],
} as const;

const TOUR = [
  {
    title: "Capturer",
    line: "Dictez ou écrivez une note. Scribe en extrait les tâches tout seul.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="9" y="2.5" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    ),
  },
  {
    title: "Tâches",
    line: "L'IA propose, vous validez d'un tap. Rien ne s'escalade sans votre accord.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.2 2.2L15.5 9.5" />
      </svg>
    ),
  },
  {
    title: "Passation",
    line: "En fin de shift, un rapport part à l'équipe suivante — vous voyez qui l'a lu.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 8h12M12 4l4 4-4 4" />
        <path d="M20 16H8M12 20l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function DemoOnboarding() {
  const [role, setRole] = useState<"manager" | "employe">("manager");
  const [step, setStep] = useState(0); // 0..3
  // Manager
  const [orgName, setOrgName] = useState("");
  const [count, setCount] = useState(2);
  const [emails, setEmails] = useState<string[]>(["", ""]);
  // Employé
  const [myName, setMyName] = useState("");
  const [myColor, setMyColor] = useState(PALETTE[2]);
  // Tour partagé
  const [tour, setTour] = useState(0);

  const switchRole = (r: "manager" | "employe") => {
    setRole(r);
    setStep(0);
    setTour(0);
  };

  const setTeamCount = (n: number) => {
    setCount(n);
    setEmails((prev) => {
      const next = [...prev];
      while (next.length < n) next.push("");
      next.length = n;
      return next;
    });
  };
  const updateEmail = (i: number, v: string) => setEmails((prev) => prev.map((e, idx) => (idx === i ? v : e)));
  const removeField = (i: number) => {
    setEmails((prev) => prev.filter((_, idx) => idx !== i));
    setCount((c) => Math.max(1, c - 1));
  };
  const filled = emails.filter((e) => e.trim()).length;

  const labels = LABELS[role];

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6">
      <style>{`
        @keyframes scribeIn { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform:none; } }
        .scribe-in { animation: scribeIn .32s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .scribe-in { animation: none; } }
      `}</style>

      {/* Toggle DÉMO : Manager / Employé */}
      <div className="mb-4 flex gap-2 rounded-pill bg-surface-container p-1">
        {(["manager", "employe"] as const).map((r) => (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`h-9 flex-1 rounded-pill text-xs font-semibold transition-colors ${
              role === r ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            {r === "manager" ? "Manager (créateur)" : "Employé (invité)"}
          </button>
        ))}
      </div>

      {/* Progression */}
      <div className="mb-1 flex items-center gap-2" aria-hidden>
        {labels.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-pill transition-colors duration-300 ${i <= step ? "bg-primary" : "bg-surface-container"}`} />
        ))}
      </div>
      <p className="mb-5 text-right text-xs font-medium text-on-surface-variant">
        Étape {step + 1} / 4 · {labels[step]}
      </p>

      <div className="rounded-card bg-white p-6 shadow-card">
        {/* ───────── Étape 1 ───────── */}
        {step === 0 && role === "manager" && (
          <div key="m0" className="scribe-in flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-secondary">Bienvenue 👋</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Donnons un nom à votre équipe — c&apos;est ce que verront vos coéquipiers.
              </p>
            </div>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Ex. Atelier du Port — relais nuit"
              className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={() => setStep(1)} disabled={!orgName.trim()} className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40">
              Continuer
            </button>
          </div>
        )}
        {step === 0 && role === "employe" && (
          <div key="e0" className="scribe-in flex flex-col gap-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-azure text-2xl">👋</div>
            <div>
              <h2 className="text-lg font-semibold text-secondary">Tu rejoins une équipe</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">Atelier du Port — relais nuit</span>
                <br />
                Invité par Allan. Plus qu&apos;une étape avant de démarrer.
              </p>
            </div>
            <button onClick={() => setStep(1)} className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]">
              C&apos;est parti
            </button>
          </div>
        )}

        {/* ───────── Étape 2 ───────── */}
        {step === 1 && role === "manager" && (
          <div key="m1" className="scribe-in flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary">Invitez votre équipe</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Scribe prend tout son sens à plusieurs : passation, accusés de lecture, coordination du shift. Ça prend 30 secondes.
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Vous êtes combien ?</p>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setTeamCount(n)} className={`h-11 flex-1 rounded-field text-sm font-semibold transition-colors ${count === n ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}>
                    {n}{n === 6 ? "+" : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {emails.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="email" inputMode="email" value={email} onChange={(e) => updateEmail(i, e.target.value)} placeholder={`coéquipier ${i + 1} — prenom@equipe.fr`} className="min-w-0 flex-1 rounded-field bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" />
                  {emails.length > 1 && (
                    <button onClick={() => removeField(i)} aria-label="Retirer ce champ" className="grid size-11 shrink-0 place-items-center rounded-field text-outline transition-colors hover:bg-surface-container hover:text-error">✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => setTeamCount(count + 1)} className="self-start min-h-[44px] text-sm font-semibold text-primary">+ Ajouter un coéquipier</button>
            </div>
            <button onClick={() => setStep(2)} className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]">
              {filled >= 1 ? `Envoyer ${filled} invitation${filled > 1 ? "s" : ""} & continuer` : "Continuer"}
            </button>
            <button onClick={() => setStep(2)} className="min-h-[44px] text-center text-xs text-outline transition-colors hover:text-on-surface-variant">Inviter plus tard</button>
          </div>
        )}
        {step === 1 && role === "employe" && (
          <div key="e1" className="scribe-in flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary">Ton profil</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Ton nom et ta couleur — c&apos;est comme ça que l&apos;équipe te reconnaît sur les tâches et les passations.
              </p>
            </div>
            <input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Ton prénom et nom (ex. Sarah Diallo)" className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Ta couleur</p>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((c) => (
                  <button key={c} onClick={() => setMyColor(c)} aria-label={`Couleur ${c}`} style={{ background: c }} className={`size-9 rounded-full transition-transform active:scale-90 ${myColor === c ? "ring-2 ring-secondary ring-offset-2" : ""}`} />
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!myName.trim()} className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40">
              Continuer
            </button>
            <button onClick={() => setStep(0)} className="min-h-[44px] text-center text-sm font-medium text-on-surface-variant">Retour</button>
          </div>
        )}

        {/* ───────── Étape 3 : mini-tour (partagé) ───────── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div key={tour} className="scribe-in flex flex-col items-center gap-4 py-2 text-center">
              <div className="grid size-16 place-items-center rounded-card bg-azure text-primary">{TOUR[tour].icon}</div>
              <div>
                <h2 className="text-lg font-semibold text-secondary">{TOUR[tour].title}</h2>
                <p className="mx-auto mt-1 max-w-xs text-sm text-on-surface-variant">{TOUR[tour].line}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2" aria-hidden>
              {TOUR.map((_, i) => (
                <button key={i} onClick={() => setTour(i)} className={`h-2 rounded-pill transition-all ${i === tour ? "w-6 bg-primary" : "w-2 bg-surface-container"}`} />
              ))}
            </div>
            {tour < TOUR.length - 1 ? (
              <button onClick={() => setTour((t) => t + 1)} className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]">Suivant</button>
            ) : (
              <button onClick={() => setStep(3)} className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]">J&apos;ai compris</button>
            )}
            <button onClick={() => setStep(3)} className="min-h-[44px] text-center text-xs text-outline transition-colors hover:text-on-surface-variant">Passer la découverte</button>
          </div>
        )}

        {/* ───────── Étape 4 : prêt (partagé) ───────── */}
        {step === 3 && (
          <div key="s3" className="scribe-in flex flex-col gap-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-azure text-2xl">🚀</div>
            <div>
              <h2 className="text-lg font-semibold text-secondary">
                {role === "manager" ? `Tout est prêt${orgName ? `, ${orgName}` : ""} !` : `Bienvenue dans l'équipe${myName ? `, ${myName.split(" ")[0]}` : ""} !`}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {role === "manager" && filled >= 1 ? `${filled} invitation${filled > 1 ? "s" : ""} envoyée${filled > 1 ? "s" : ""}. ` : ""}
                Capturez votre première note — Scribe s&apos;occupe du reste.
              </p>
            </div>
            <Link href="/demo/dashboard" className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]">
              Entrer dans Scribe →
            </Link>
            <button onClick={() => setStep(0)} className="min-h-[44px] text-center text-xs text-outline transition-colors hover:text-on-surface-variant">↺ Rejouer la démo</button>
          </div>
        )}
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-xs text-outline">
        Maquette — deux parcours : <strong>Manager</strong> (crée + invite) et <strong>Employé</strong> (rejoint + profil). Tour & dashboard partagés.
      </p>
    </main>
  );
}
