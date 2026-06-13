"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/capture", label: "Capturer", icon: "🎤" },
  { href: "/dashboard/tasks", label: "Tâches", icon: "✓" },
  { href: "/dashboard/report", label: "Rapport", icon: "📋" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className="text-lg leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
