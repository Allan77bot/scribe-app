"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrgName, completeOnboarding } from "@/lib/onboarding/actions";

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
    <div className="rounded-2xl bg-ink-700 p-6">
      {/* Progression */}
      <div className="mb-6 flex items-center gap-2" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              background:
                i < step ? "var(--gradient-accent)" : "var(--color-ink-600)",
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-cyan">
              Étape 1 / 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-cloud-50">
              Nommez votre équipe
            </h2>
            <p className="mt-1 text-sm text-muted">
              C&apos;est le nom que verront vos coéquipiers dans Scribe.
            </p>
          </div>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Ex. Atelier du Port — relais nuit"
            className="min-h-[48px] w-full rounded-lg border border-ink-600 bg-ink-800 px-3.5 text-base text-cloud-50 outline-none focus:border-accent-cyan"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={saveName}
            disabled={isPending || !orgName.trim()}
            className="min-h-[48px] rounded-xl text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-40"
            style={{ background: "var(--gradient-brand)" }}
          >
            {isPending ? "…" : "Continuer"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-cyan">
              Étape 2 / 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-cloud-50">
              Invitez un coéquipier
            </h2>
            <p className="mt-1 text-sm text-muted">
              Scribe prend tout son sens à plusieurs : accusés de lecture,
              passation de relais, coordination du shift.
            </p>
          </div>
          {/* Honnêteté : les invitations par e-mail à jeton signé arrivent dans une
              prochaine version (jamais de rattachement par org_id brut — règle d'or n°2). */}
          <div className="rounded-lg border border-ink-600 bg-ink-800 p-4">
            <p className="text-sm text-cloud-50">
              Les invitations par e-mail arrivent très bientôt.
            </p>
            <p className="mt-1 text-xs text-muted">
              En attendant, vous pouvez déjà capturer vos premières notes — vos
              coéquipiers les retrouveront dès leur arrivée.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="min-h-[48px] rounded-xl border border-ink-600 px-4 text-sm font-medium text-cloud-50"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              className="min-h-[48px] flex-1 rounded-xl text-sm font-semibold text-cloud-50"
              style={{ background: "var(--gradient-brand)" }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-cyan">
              Étape 3 / 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-cloud-50">
              Capturez votre première note
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dictez ou collez un texte. Scribe en extrait les tâches — vous les
              confirmez d&apos;un tap, puis seulement l&apos;équipe prend le relais.
            </p>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={finish}
            disabled={isPending}
            className="min-h-[48px] rounded-xl text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-40"
            style={{ background: "var(--gradient-brand)" }}
          >
            {isPending ? "…" : "Capturer une note"}
          </button>
          <button
            onClick={() => setStep(2)}
            className="min-h-[44px] text-sm font-medium text-muted"
          >
            Retour
          </button>
        </div>
      )}

      {/* Sortie discrète disponible à toute étape */}
      <button
        onClick={skip}
        disabled={isPending}
        className="mt-5 w-full text-center text-xs text-hint transition-colors hover:text-muted"
      >
        Passer l&apos;introduction
      </button>
    </div>
  );
}
