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
    href: "/dashboard/handover",
    label: "Passation",
    icon: (
      <>
        <path d="M3 8h13l-3-3M21 16H8l3 3" />
      </>
    ),
  },
  {
    href: "/dashboard/team",
    label: "Équipe",
    icon: (
      <>
        <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
        <circle cx="10" cy="7.5" r="3" />
        <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.7a3 3 0 0 1 0 5.6" />
      </>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Profil",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="9.5" r="3.5" />
        <path d="M5.5 19a7.5 7.5 0 0 1 13 0" />
      </>
    ),
  },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      // Fond carte clair + hairline haut (DS : bordure OU ombre, pas les deux).
      // Léger flou pour rester lisible au scroll. safe-area iOS.
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur"
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
                // Actif = primary + barre de 2 px (jamais l'opacité seule).
                // Inactif = texte secondaire (contraste AA).
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 transition-colors ${
                  active ? "text-primary" : "text-on-surface-variant"
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
                  <span className="absolute top-0 h-0.5 w-8 rounded-pill bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
