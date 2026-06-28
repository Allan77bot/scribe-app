import Link from "next/link";

// Réassurance RGPD/UE. Fond status-validated-bg (bascule clair/sombre) + texte
// cyan-text (AA dans les deux thèmes). Preuve de confiance, liens légaux réels.
export function TrustBar() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-lg border border-outline-variant bg-status-validated-bg px-5 py-4 text-center text-sm leading-relaxed text-cyan-text">
        <span aria-hidden>🇪🇺 </span>
        <strong className="font-bold">Vos données restent en Europe.</strong>{" "}
        Elles ne servent jamais à entraîner l&apos;IA.{" "}
        <Link
          href="/confidentialite"
          className="font-bold underline underline-offset-4"
        >
          Confidentialité
        </Link>
        {" · "}
        <Link
          href="/conformite"
          className="font-bold underline underline-offset-4"
        >
          Conformité
        </Link>
      </div>
    </section>
  );
}
