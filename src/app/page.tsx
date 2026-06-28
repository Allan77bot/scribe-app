import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Carte blanche flottante (élévation niveau 1). */}
        <div className="w-full max-w-md rounded-card bg-card p-6 shadow-card">
          <h1 className="sr-only">Scribe IA</h1>
          <Logo size={48} className="mb-6 justify-center" />
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            Transformez vos notes vocales en coordination d&apos;équipe&nbsp;: tâches suivies,
            accusés de lecture, rapport de passation automatique.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/signup"
              className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              Créer mon équipe
            </Link>
            <Link
              href="/login"
              className="flex h-14 w-full items-center justify-center rounded-pill bg-azure px-6 text-base font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
