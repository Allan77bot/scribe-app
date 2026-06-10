import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Scribe
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Transforme tes notes vocales en coordination d&apos;équipe : tâches
          suivies, accusés de lecture, rapport de passation automatique.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-slate-700"
          >
            Créer mon équipe
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
