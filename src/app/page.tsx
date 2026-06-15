import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center bg-ink-900">
      <div className="w-full max-w-md">
        {/* Marque */}
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-accent shadow-glow">
          <span className="text-2xl font-bold text-cloud-50">S</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-cloud-50">
          Scribe
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">
          Transforme tes notes vocales en coordination d&apos;équipe&nbsp;:
          tâches suivies, accusés de lecture, rapport de passation automatique.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-gradient-accent px-4 py-3.5 text-base font-semibold text-ink-900 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Créer mon équipe
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-ink-600 px-4 py-3.5 text-base font-medium text-cloud-50 transition-colors hover:border-accent-cyan hover:text-accent-cyan"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
