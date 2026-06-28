import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

// Chrome commun des pages légales : en-tête (logo → accueil), conteneur lisible, footer.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-outline-variant px-6 py-4 print:hidden">
        <Link href="/" aria-label="Retour à l'accueil" className="inline-flex">
          <Logo size={32} />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}
