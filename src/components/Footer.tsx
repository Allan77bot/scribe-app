import Link from "next/link";

// Liens légaux — présents sur la landing et toutes les pages (legal).
const LEGAL_LINKS = [
  { href: "/conformite", label: "Conformité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant px-6 py-8 text-center print:hidden">
      <nav
        aria-label="Liens légaux"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
      >
        {LEGAL_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-on-surface-variant underline-offset-4 hover:text-primary hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-xs text-outline">© {new Date().getFullYear()} Scribe IA</p>
    </footer>
  );
}
