"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

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
  label = "Inviter un membre",
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

  return (
    <>
      {/* Déclencheur : bouton de marque (page Équipe) ou lien discret (onboarding). */}
      {variant === "primary" ? (
        <Button
          type="button"
          size="lg"
          fullWidth
          onClick={() => setOpen(true)}
          iconLeft={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
        >
          {label}
        </Button>
      ) : (
        <Button type="button" variant="text" size="md" onClick={() => setOpen(true)}>
          {label}
        </Button>
      )}

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
            className="absolute inset-0 bg-secondary/40"
            style={{ backdropFilter: "blur(2px)" }}
          />

          {/* Feuille */}
          <div
            className="relative w-full max-w-md rounded-t-card bg-card px-5 pb-8 pt-3 shadow-modal"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
          >
            {/* Poignée */}
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-outline-variant" aria-hidden />

            {!sent ? (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-secondary">
                    Inviter un coéquipier
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Scribe envoie un lien d&apos;invitation. Il rejoint ton équipe
                    en quelques secondes — le lien expire sous 72 h.
                  </p>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="eyebrow">Adresse e-mail</span>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    inputMode="email"
                    placeholder="prenom@equipe.fr"
                    className="w-full rounded-field bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                {error && (
                  <p className="rounded-field bg-error-container px-3 py-2 text-sm text-on-error-container">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={pending || !email.trim()}
                >
                  {pending ? "Envoi…" : "Envoyer l'invitation"}
                </Button>
                <Button type="button" variant="text" size="md" fullWidth onClick={close}>
                  Annuler
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-secondary">
                    Invitation prête
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {sent.emailSent
                      ? `Scribe a envoyé le lien à ${sent.email}.`
                      : `On n'a pas pu envoyer l'e-mail à ${sent.email}. Copie le lien et transmets-le toi-même.`}
                  </p>
                </div>

                {/* Lien copiable — toujours visible, même si l'e-mail est parti. */}
                <div className="flex items-center gap-2 rounded-field bg-surface-container-low p-2.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-on-surface-variant">
                    {sent.link}
                  </span>
                  <Button type="button" variant="secondary" size="md" onClick={copyLink}>
                    {copied ? "Copié" : "Copier"}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    setSent(null);
                    setEmail("");
                  }}
                >
                  Inviter quelqu&apos;un d&apos;autre
                </Button>
                <Button type="button" variant="text" size="md" fullWidth onClick={close}>
                  Terminé
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
