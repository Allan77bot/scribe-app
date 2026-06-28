import Link from "next/link";

// Bande inversée (toujours contrastée clair ET sombre via inverse-surface).
// Bouton clair sur la bande (pas de cobalt plein sur marine — cf. spec §2.5).
export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-16">
      <div className="rounded-card bg-inverse-surface px-6 py-12 text-center">
        {/* text-inverse-on-surface! : la règle globale h1-h4{color:secondary} (hors @layer)
            bat les utilitaires en Tailwind v4 → le ! force la couleur inversée, sinon le titre
            est illisible (marine sur marine en clair, clair sur clair en sombre). */}
        <h2 className="text-2xl font-extrabold tracking-tight text-inverse-on-surface! md:text-3xl">
          Essayez sur votre prochaine relève.
        </h2>
        <p className="mt-2 text-inverse-on-surface/80">
          Créez votre équipe en deux minutes.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-pill bg-card px-7 text-base font-semibold text-primary shadow-card transition-all hover:brightness-95 active:scale-[0.98]"
        >
          Créer mon équipe
        </Link>
      </div>
    </section>
  );
}
