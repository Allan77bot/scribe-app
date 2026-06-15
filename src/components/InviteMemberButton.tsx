"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Feuille remontante (bottom sheet) d'invitation — cf. brand guide §5.
// Sur mobile on privilégie la feuille à la modale centrée : poignée, voile,
// action primaire en bas (pouce-accessible). Appelle POST /api/invites/send.

type Sent = { email: string; link: string; emailSent: boolean };

type Props = {
  // Variante visuelle du déclencheur : bouton de marque (page Équipe) ou lien
  // discret (onboarding, où la feuille s'ouvre depuis l'étape 2).
  variant?: "primary" | "ghost";
  label?: string;
};

export default function InviteMemberButton({
  variant = "primary",
  label = "Inviter un coéquipier",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ouverture : focus l'e-mail, verrouille le scroll de fond, ferme sur Échap.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    setError(null);
    setSent(null);
    setEmail("");
    setCopied(false);
    setPending(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "L'envoi a échoué. Réessaie.");
        return;
      }
      setSent({ email: data.email, link: data.link, emailSent: data.emailSent });
      // Rafraîchit la liste des invitations en attente sur la page Équipe.
      router.refresh();
    } catch {
      setError("Connexion impossible. Vérifie ta connexion et réessaie.");
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const triggerClass =
    variant === "primary"
      ? "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-cloud-50 transition-opacity hover:opacity-95 bg-gradient-brand"
      : "inline-flex min-h-[44px] items-center justify-center text-sm font-semibold text-accent-cyan";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Inviter un coéquipier"
        >
          {/* Voile de fond — ferme au tap. */}
          <button
            type="button"
            aria-label="Fermer"
            onClick={close}
            className="absolute inset-0 bg-ink-900/60"
            style={{ backdropFilter: "blur(2px)" }}
          />

          {/* Feuille */}
          <div
            className="relative w-full max-w-md rounded-t-2xl border-t border-ink-600 bg-ink-800 px-5 pb-8 pt-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
          >
            {/* Poignée */}
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-ink-600" aria-hidden />

            {!sent ? (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-cloud-50">
                    Inviter un coéquipier
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Scribe envoie un lien d&apos;invitation. Il rejoint ton équipe
                    en quelques secondes — le lien expire sous 72 h.
                  </p>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Adresse e-mail
                  </span>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    inputMode="email"
                    placeholder="prenom@equipe.fr"
                    className="min-h-[48px] w-full rounded-lg border border-ink-600 bg-ink-900 px-3.5 text-base text-cloud-50 outline-none transition-colors focus:border-accent-cyan"
                  />
                </label>

                {error && (
                  <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending || !email.trim()}
                  className="min-h-[48px] rounded-xl text-sm font-semibold text-cloud-50 transition-opacity disabled:opacity-40 bg-gradient-brand"
                >
                  {pending ? "Envoi…" : "Envoyer l'invitation"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="min-h-[44px] text-sm font-medium text-muted"
                >
                  Annuler
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-cloud-50">
                    Invitation prête
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {sent.emailSent
                      ? `Scribe a envoyé le lien à ${sent.email}.`
                      : `On n'a pas pu envoyer l'e-mail à ${sent.email}. Copie le lien et transmets-le toi-même.`}
                  </p>
                </div>

                {/* Lien copiable — toujours visible, même si l'e-mail est parti. */}
                <div className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-900 p-2.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">
                    {sent.link}
                  </span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="shrink-0 rounded-md border border-ink-600 px-2.5 py-1.5 text-xs font-semibold text-accent-cyan transition-colors hover:border-accent-cyan"
                  >
                    {copied ? "Copié" : "Copier"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSent(null);
                    setEmail("");
                  }}
                  className="min-h-[48px] rounded-xl border border-ink-600 text-sm font-semibold text-cloud-50"
                >
                  Inviter quelqu&apos;un d&apos;autre
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="min-h-[44px] text-sm font-medium text-muted"
                >
                  Terminé
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
