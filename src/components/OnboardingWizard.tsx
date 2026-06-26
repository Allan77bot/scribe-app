"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrgName,
  saveOnboardingProfile,
  sendOnboardingInvites,
  completeOnboarding,
} from "@/lib/onboarding/actions";
import OnboardingTour from "@/components/OnboardingTour";
import ColorPicker from "@/components/ColorPicker";

// ════════════════════════════════════════════════════════════════════════
// Wizard d'onboarding — DEUX parcours selon le rôle (porté fidèlement de la
// maquette validée src/app/demo/onboarding/page.tsx) :
//   • Manager (admin)   : Nommer l'équipe → Inviter → Découverte → Prêt.
//   • Employé (member)  : Bienvenue → Profil → Découverte → Prêt.
// Le mini-tour (étape Découverte) et l'écran Prêt sont partagés. Toute la copy
// est au VOUS. Tout passe par les server actions de @/lib/onboarding (SESSION +
// RLS) ; la navigation finale est pilotée ici (router.push), pas côté serveur.
// ════════════════════════════════════════════════════════════════════════

type Props = {
  role: "admin" | "member";
  initialOrgName: string; // manager : préremplir « nommer l'équipe »
  orgName: string; // employé : écran bienvenue
  inviterName?: string | null; // employé : « invité par … »
  displayName: string; // employé : préremplir profil
  initialColor?: string | null; // employé : couleur de départ
  takenColors?: string[]; // employé : couleurs déjà prises dans l'org (à griser)
};

const LABELS = {
  admin: ["Équipe", "Invitations", "Découverte", "Prêt"],
  member: ["Bienvenue", "Profil", "Découverte", "Prêt"],
} as const;

export default function OnboardingWizard({
  role,
  initialOrgName,
  orgName,
  inviterName,
  displayName,
  initialColor,
  takenColors = [],
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..3
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Manager — nom d'équipe + invitations.
  const [teamName, setTeamName] = useState(initialOrgName);
  const [count, setCount] = useState(2);
  const [emails, setEmails] = useState<string[]>(["", ""]);
  const [sentCount, setSentCount] = useState(0);
  // Récap des adresses non envoyées (invalides / déjà membres / échecs), affiché
  // sur l'écran final — on ne fait jamais croire qu'une invitation est partie.
  const [inviteNote, setInviteNote] = useState<string | null>(null);

  // Employé — profil.
  const [myName, setMyName] = useState(displayName);
  const profileFormRef = useRef<HTMLFormElement>(null);

  const labels = LABELS[role];

  // ── Manager : gestion dynamique des champs e-mail (idée A) ──────────────
  const setTeamCount = (n: number) => {
    setCount(n);
    setEmails((prev) => {
      const next = [...prev];
      while (next.length < n) next.push("");
      next.length = n;
      return next;
    });
  };
  const updateEmail = (i: number, v: string) =>
    setEmails((prev) => prev.map((e, idx) => (idx === i ? v : e)));
  const removeField = (i: number) => {
    setEmails((prev) => prev.filter((_, idx) => idx !== i));
    setCount((c) => Math.max(1, c - 1));
  };
  const filled = emails.filter((e) => e.trim()).length;

  // ── Actions ──────────────────────────────────────────────────────────────
  // Manager étape 1 — enregistre le nom de l'équipe puis avance.
  const saveName = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateOrgName(teamName);
      if (res.error) setError(res.error);
      else setStep(1);
    });
  };

  // Manager étape 2 — envoie le lot d'invitations (les vides sont filtrés côté
  // serveur) puis avance. « sent » et « already_invited » comptent comme succès ;
  // les autres statuts (invalide, déjà membre, échec) sont surfacés, jamais avalés.
  const sendInvites = () => {
    setError(null);
    setInviteNote(null);
    startTransition(async () => {
      const { results } = await sendOnboardingInvites(emails);
      const ok = results.filter(
        (r) => r.status === "sent" || r.status === "already_invited",
      ).length;
      const invalid = results.filter((r) => r.status === "invalid").length;
      const members = results.filter((r) => r.status === "already_member").length;
      const failed = results.filter((r) => r.status === "error").length;

      // Résumé lisible des adresses non envoyées (le cas échéant).
      const skipped: string[] = [];
      if (invalid) skipped.push(`${invalid} invalide${invalid > 1 ? "s" : ""}`);
      if (members) skipped.push(`${members} déjà dans l'équipe`);
      if (failed) skipped.push(`${failed} échec${failed > 1 ? "s" : ""} d'envoi`);

      // Des adresses étaient saisies mais AUCUNE n'a abouti → on reste sur l'étape
      // et on explique, au lieu de prétendre que c'est parti.
      if (ok === 0 && filled >= 1) {
        setError(
          `Aucune invitation envoyée — ${skipped.join(", ")}. Corrigez les adresses, ou « Inviter plus tard ».`,
        );
        return;
      }

      setSentCount(ok);
      setInviteNote(skipped.length ? `Ignorées : ${skipped.join(", ")}.` : null);
      setStep(2);
    });
  };

  // Employé étape 2 — enregistre nom + couleur. La couleur vient du <input
  // hidden name="color"> rendu par ColorPicker → lue via FormData.
  const saveProfile = () => {
    setError(null);
    const color = profileFormRef.current
      ? String(new FormData(profileFormRef.current).get("color") ?? "")
      : "";
    startTransition(async () => {
      const res = await saveOnboardingProfile(myName, color);
      if (res.error) setError(res.error);
      else setStep(2);
    });
  };

  // Étape finale (partagée) — marque l'onboarding terminé puis entre dans l'app.
  const finish = () => {
    setError(null);
    startTransition(async () => {
      const res = await completeOnboarding();
      if (res.error) setError(res.error);
      else router.push("/dashboard");
    });
  };

  const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

  return (
    <div>
      <style>{`
        @keyframes scribeIn { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform:none; } }
        .scribe-in { animation: scribeIn .32s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .scribe-in { animation: none; } }
      `}</style>

      {/* Progression */}
      <div className="mb-1 flex items-center gap-2" aria-hidden>
        {labels.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-pill transition-colors duration-300 ${
              i <= step ? "bg-primary" : "bg-surface-container"
            }`}
          />
        ))}
      </div>
      <p className="mb-5 text-right text-xs font-medium text-on-surface-variant">
        Étape {step + 1} / 4 · {labels[step]}
      </p>

      <div className="rounded-card bg-card p-6 shadow-card">
        {/* ───────── Étape 1 — Manager : nommer l'équipe ───────── */}
        {step === 0 && role === "admin" && (
          <div key="m0" className="scribe-in flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-secondary">Bienvenue 👋</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Donnons un nom à votre équipe — c&apos;est ce que verront vos
                coéquipiers.
              </p>
            </div>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ex. Atelier du Port — relais nuit"
              className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              onClick={saveName}
              disabled={isPending || !teamName.trim()}
              className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? "…" : "Continuer"}
            </button>
          </div>
        )}

        {/* ───────── Étape 1 — Employé : bienvenue ───────── */}
        {step === 0 && role === "member" && (
          <div key="e0" className="scribe-in flex flex-col gap-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-azure text-2xl">
              👋
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary">
                Vous rejoignez une équipe
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{orgName}</span>
                <br />
                {inviterName ? `Invité par ${inviterName}. ` : ""}Plus qu&apos;une
                étape avant de démarrer.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              C&apos;est parti
            </button>
          </div>
        )}

        {/* ───────── Étape 2 — Manager : inviter ───────── */}
        {step === 1 && role === "admin" && (
          <div key="m1" className="scribe-in flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary">
                Invitez votre équipe
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Scribe prend tout son sens à plusieurs : passation, accusés de
                lecture, coordination du shift. Ça prend 30 secondes.
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Vous êtes combien ?
              </p>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTeamCount(n)}
                    className={`h-11 flex-1 rounded-field text-sm font-semibold transition-colors ${
                      count === n
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    {n}
                    {n === 6 ? "+" : ""}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {emails.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                    placeholder={`coéquipier ${i + 1} — prenom@equipe.fr`}
                    className="min-w-0 flex-1 rounded-field bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeField(i)}
                      aria-label="Retirer ce champ"
                      className="grid size-11 shrink-0 place-items-center rounded-field text-outline transition-colors hover:bg-surface-container hover:text-error"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setTeamCount(count + 1)}
                className="min-h-[44px] self-start text-sm font-semibold text-primary"
              >
                + Ajouter un coéquipier
              </button>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              onClick={sendInvites}
              disabled={isPending}
              className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
            >
              {isPending
                ? "…"
                : filled >= 1
                  ? `Envoyer ${filled} invitation${filled > 1 ? "s" : ""} & continuer`
                  : "Continuer"}
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={isPending}
              className="min-h-[44px] text-center text-xs text-outline transition-colors hover:text-on-surface-variant"
            >
              Inviter plus tard
            </button>
          </div>
        )}

        {/* ───────── Étape 2 — Employé : profil ───────── */}
        {step === 1 && role === "member" && (
          <form
            ref={profileFormRef}
            key="e1"
            onSubmit={(e) => e.preventDefault()}
            className="scribe-in flex flex-col gap-4"
          >
            <div>
              <h2 className="text-lg font-semibold text-secondary">Votre profil</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Votre nom et votre couleur — c&apos;est comme ça que l&apos;équipe
                vous reconnaît sur les tâches et les passations.
              </p>
            </div>
            <input
              name="display_name"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Votre prénom et nom (ex. Sarah Diallo)"
              className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Votre couleur
              </p>
              {/* ColorPicker expose la valeur via <input hidden name="color"> ;
                  l'unicité dans l'org est aussi vérifiée côté serveur. */}
              <ColorPicker current={initialColor ?? null} taken={takenColors} />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              type="button"
              onClick={saveProfile}
              disabled={isPending || !myName.trim()}
              className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? "…" : "Continuer"}
            </button>
            <button
              type="button"
              onClick={() => setStep(0)}
              disabled={isPending}
              className="min-h-[44px] text-center text-sm font-medium text-on-surface-variant"
            >
              Retour
            </button>
          </form>
        )}

        {/* ───────── Étape 3 — Découverte (mini-tour partagé) ───────── */}
        {step === 2 && (
          <OnboardingTour onDone={() => setStep(3)} />
        )}

        {/* ───────── Étape 4 — Prêt (partagé) ───────── */}
        {step === 3 && (
          <div key="s3" className="scribe-in flex flex-col gap-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-azure text-2xl">
              🚀
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary">
                {role === "admin"
                  ? `Tout est prêt${teamName.trim() ? `, ${teamName.trim()}` : ""} !`
                  : `Bienvenue dans l'équipe${
                      myName.trim() ? `, ${firstName(myName)}` : ""
                    } !`}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {role === "admin" && sentCount >= 1
                  ? `${sentCount} invitation${sentCount > 1 ? "s" : ""} envoyée${
                      sentCount > 1 ? "s" : ""
                    }. `
                  : ""}
                Capturez votre première note — Scribe s&apos;occupe du reste.
              </p>
              {role === "admin" && inviteNote && (
                <p className="mt-2 text-xs text-on-surface-variant">{inviteNote}</p>
              )}
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              onClick={finish}
              disabled={isPending}
              className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? "…" : "Entrer dans Scribe →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
