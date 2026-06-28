"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "./useInView";

// Enveloppe une section : fondu + léger glissement vertical quand elle entre à
// l'écran. Reste un simple <div> (pas de translateX → aucun débordement mobile).
// Les enfants sont des Server Components (passés en children) → rendu serveur
// préservé. L'état caché vit dans le CSS (.reveal), neutralisé en reduced-motion
// et sans JS.
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={`reveal${inView ? " is-visible" : ""}`}>
      {children}
    </div>
  );
}
