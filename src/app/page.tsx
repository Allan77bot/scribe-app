import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12 text-center">
      {/* Carte blanche flottante (élévation niveau 1). */}
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-card">
        {/* Marque officielle — mark (S + coche de validation) + mot-marque. */}
        <h1 className="sr-only">Scribe IA</h1>
        <Logo size={48} className="mb-6 justify-center" />
        <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
          Transforme tes notes vocales en coordination d&apos;équipe&nbsp;:
          tâches suivies, accusés de lecture, rapport de passation automatique.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          {/* Bouton primary : pilule, 56px de haut, fond plein. */}
          <Link
            href="/signup"
            className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            Créer mon équipe
          </Link>
          {/* Bouton secondary : fond azure, texte primary, sans bordure. */}
          <Link
            href="/login"
            className="flex h-14 w-full items-center justify-center rounded-pill bg-azure px-6 text-base font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
