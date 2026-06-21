import Link from "next/link";

// ════════════════════════════════════════════════════════════════════════
// DÉMO — espace PUBLIC sans authentification, pour prévisualiser l'UI sans login.
// Données fictives, aucun appel Supabase. THROWAWAY : à retirer avant toute PR
// (ne doit jamais partir en prod — ce n'est pas une route applicative).
// ════════════════════════════════════════════════════════════════════════
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-secondary px-4 py-2 text-xs font-semibold text-white">
        <span>DÉMO · sans connexion</span>
        <Link
          href="/demo"
          className="rounded-pill bg-white/15 px-2.5 py-1 transition-colors hover:bg-white/25"
        >
          Écrans démo
        </Link>
      </div>
      {children}
    </div>
  );
}
