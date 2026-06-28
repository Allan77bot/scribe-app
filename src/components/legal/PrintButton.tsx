"use client";

// Bouton d'impression (→ PDF via le navigateur). Masqué à l'impression.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-pill bg-azure px-4 py-2 text-sm font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
    >
      Imprimer / PDF
    </button>
  );
}
