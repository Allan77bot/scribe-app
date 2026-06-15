"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrgName, completeOnboarding } from "@/lib/onboarding/actions";
import InviteMemberButton from "@/components/InviteMemberButton";

type Props = {
  initialOrgName: string;
};

const TOTAL_STEPS = 3;

// Wizard d'onboarding orienté « aha » (audit UX §2.5) : on amène l'utilisateur à la
// première boucle de valeur — nommer l'org → (inviter) → capturer sa 1re note.
export default function OnboardingWizard({ initialOrgName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState(initialOrgName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Étape 1 → enregistre le nom puis avance.
  const saveName = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateOrgName(orgName);
      if (res.error) setError(res.error);
      else setStep(2);
    });
  };

  // Étape finale → marque l'onboarding terminé puis envoie capturer la 1re note.
  const finish = () => {
    setError(null);
    startTransition(async () => {
      const res = await completeOnboarding();
      if (res.error) setError(res.error);
      else router.push("/dashboard/capture");
    });
  };

  // Permet de quitter le wizard sans le refaire à chaque visite.
  const skip = () => {
    startTransition(async () => {
      await completeOnboarding();
      router.push("/dashboard");
    });
  };

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      {/* Progression */}
      <div className="mb-6 flex items-center gap-2" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-pill transition-colors ${
              i < step ? "bg-primary" : "bg-surface-container"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Étape 1 / 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-secondary">
              Nommez votre équipe
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              C&apos;est le nom que verront vos coéquipiers dans Scribe.
            </p>
          </div>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Ex. Atelier du Port — relais nuit"
            className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            onClick={saveName}
            disabled={isPending || !orgName.trim()}
            className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
          >
            {isPending ? "…" : "Continuer"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Étape 2 / 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-secondary">
              Invitez un coéquipier
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Scribe prend tout son sens à plusieurs : accusés de lecture,
              passation de relais, coordination du shift.
            </p>
          </div>
          {/* Invitation par jeton signé (jamais de rattachement par org_id brut —
              règle d'or n°2). La feuille envoie un lien e-mail expirant sous 72 h. */}
          <InviteMemberButton label="Inviter par e-mail" />
          <p className="text-center text-xs text-outline">
            Optionnel — vous pouvez aussi inviter plus tard depuis l&apos;onglet Équipe.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex h-14 items-center justify-center rounded-pill bg-azure px-6 text-base font-semibold text-primary transition-all hover:brightness-95"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex h-14 flex-1 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Étape 3 / 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-secondary">
              Capturez votre première note
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Dictez ou collez un texte. Scribe en extrait les tâches — vous les
              confirmez d&apos;un tap, puis seulement l&apos;équipe prend le relais.
            </p>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            onClick={finish}
            disabled={isPending}
            className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
          >
            {isPending ? "…" : "Capturer une note"}
          </button>
          <button
            onClick={() => setStep(2)}
            className="min-h-[44px] text-sm font-medium text-on-surface-variant"
          >
            Retour
          </button>
        </div>
      )}

      {/* Sortie discrète disponible à toute étape */}
      <button
        onClick={skip}
        disabled={isPending}
        className="mt-5 w-full text-center text-xs text-outline transition-colors hover:text-on-surface-variant"
      >
        Passer l&apos;introduction
      </button>
    </div>
  );
}
