import Link from "next/link";
import { AppMockup } from "./AppMockup";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-pill border border-outline-variant bg-card px-3 py-1 text-xs font-semibold text-on-surface-variant">
            Pour les équipes qui se relaient · 3×8, 2×8, postes
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-secondary md:text-5xl">
            Rien ne se perd entre les équipes.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-on-surface-variant">
            Vos équipes se relaient, l&apos;information non. Dictez vos notes de
            fin de poste&nbsp;: l&apos;IA en sort les tâches, votre équipe valide,
            et la relève reçoit tout.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-14 items-center justify-center rounded-pill bg-primary px-7 text-base font-semibold text-on-primary shadow-card transition-all hover:bg-primary-container active:scale-[0.98]"
            >
              Créer mon équipe
            </Link>
            <Link
              href="#comment-ca-marche"
              className="inline-flex min-h-14 items-center justify-center rounded-pill bg-transparent px-7 text-base font-semibold text-primary ring-1 ring-inset ring-outline-variant transition-all hover:bg-azure active:scale-[0.98]"
            >
              Voir comment ça marche
            </Link>
          </div>
        </div>
        <div>
          <AppMockup />
          <p className="mt-3 text-center text-xs italic text-on-surface-variant">
            L&apos;écran Tâches&nbsp;: l&apos;IA a proposé, votre équipe valide
            d&apos;un geste.
          </p>
        </div>
      </div>
    </section>
  );
}
