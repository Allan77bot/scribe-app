"use client";

import { useRef } from "react";
import { StatusBadge, type TaskStatus } from "@/components/ui/StatusBadge";
import { useInView } from "./useInView";

// Faux écran « Tâches » reconstruit en markup (illustration, jamais une donnée
// réelle) — bascule clair/sombre via les tokens. Décoratif → aria-hidden.
// Animation : les 3 lignes apparaissent en cascade quand l'écran entre en vue
// (montre le produit en action). Neutralisée en reduced-motion / sans JS (CSS).
const TASKS: { label: string; status: TaskStatus; dot: string }[] = [
  { label: "Recontrôler la palette quai 3", status: "validated", dot: "bg-cyan" },
  { label: "Commander films étirables", status: "proposed", dot: "bg-status-proposed" },
  { label: "Relève chariot élévateur n°2", status: "done", dot: "bg-status-done" },
];

export function AppMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      aria-hidden
      className={`mock-reveal rounded-card border border-outline-variant bg-card p-4 shadow-md${
        inView ? " is-visible" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-secondary">Tâches du poste</span>
        <span className="tnum text-xs font-semibold text-on-surface-variant">
          Lu par 6 / 8
        </span>
      </div>
      <ul className="space-y-2">
        {TASKS.map((t, i) => (
          <li
            key={t.label}
            className="task-row flex items-center gap-3 rounded-lg border border-line-soft p-3"
            style={{ transitionDelay: `${i * 130}ms` }}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} />
            <span className="flex-1 text-sm text-on-surface">{t.label}</span>
            <StatusBadge status={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
