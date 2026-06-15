"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Barre de navigation basse, mobile-first. Présente sur toutes les pages du
// dashboard via `dashboard/layout.tsx`. Met en évidence la route active.
// Icônes en SVG inline (stroke currentColor) → zéro dépendance ajoutée.

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const ITEMS: Item[] = [
  {
    href: "/dashboard",
    label: "Accueil",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
    ),
  },
  {
    href: "/dashboard/capture",
    label: "Capturer",
    icon: (
      <>
        <rect x="9" y="2.5" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
  },
  {
    href: "/dashboard/tasks",
    label: "Tâches",
    icon: (
      <>
        <path d="M9 5h11M9 12h11M9 19h11" />
        <path d="m3.5 4.8 1 1 1.5-1.8M3.5 11.8l1 1 1.5-1.8M3.5 18.8l1 1 1.5-1.8" />
      </>
    ),
  },
  {
    href: "/dashboard/report",
    label: "Rapport",
    icon: (
      <>
        <path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21V2.5Z" />
        <path d="M14 2.5v4h4M9 13h6M9 17h6" />
      </>
    ),
  },
  {
    href: "/dashboard/billing",
    label: "Facturation",
    icon: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M2.5 9.5h19" />
      </>
    ),
  },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      // Fond marine translucide + flou (cf. brand guide §5). safe-area iOS.
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-600 bg-ink-900/90 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-md">
        {ITEMS.map((item) => {
          // L'accueil ne doit pas s'allumer sur les sous-routes ; les autres si.
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                // Actif = accent cyan + barre de 3 px (jamais l'opacité seule).
                // Inactif = texte secondaire (contraste AA).
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 transition-colors ${
                  active ? "text-accent-cyan" : "text-muted"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2 : 1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-cyan" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
