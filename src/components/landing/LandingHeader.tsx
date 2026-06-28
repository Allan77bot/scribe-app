import Link from "next/link";
import { Logo } from "@/components/Logo";

// En-tête de la landing : marque à gauche, connexion + CTA à droite.
export function LandingHeader() {
  return (
    <header className="w-full border-b border-outline-variant">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4"
      >
        <Link href="/" aria-label="Accueil Scribe IA">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary shadow-card transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            Créer mon équipe
          </Link>
        </div>
      </nav>
    </header>
  );
}
