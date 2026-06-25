"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { logout } from "@/lib/auth/actions";

// Pastille de profil en haut à droite du dashboard. Tap → petit menu : Réglages
// ou déconnexion. Avatar 32px (photo ou monogramme couleur). Ferme au clic
// extérieur / Échap. Mobile-first : reste dans la marge de sécurité.

type Props = {
  name: string;
  email: string;
  color?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
};

export default function UserMenu({ name, email, color, avatarUrl, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed right-4 top-3 z-40"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu du compte"
        className="rounded-full transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Avatar
          name={name}
          email={email}
          color={color}
          avatarUrl={avatarUrl}
          isAdmin={isAdmin}
          size={32}
        />
      </button>

      {open && (
        <div
          role="menu"
          // Carte calme DS : rayon lg, ombre modale seule (jamais ombre+bordure).
          className="absolute right-0 top-11 w-52 overflow-hidden rounded-lg bg-card py-2 shadow-modal"
        >
          <div className="px-4 pb-2 pt-1">
            <p className="truncate text-sm font-semibold text-on-surface">
              {name || email.split("@")[0]}
            </p>
            <p className="truncate text-xs text-on-surface-variant">{email}</p>
          </div>
          <div className="h-px bg-line" />
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Réglages
          </Link>
          <ThemeToggle className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low" />
          <div className="h-px bg-line" />
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5M21 12H9" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
