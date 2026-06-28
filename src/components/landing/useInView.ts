"use client";

import { useEffect, useState, type RefObject } from "react";

// Renvoie true dès que l'élément entre dans le viewport (une seule fois, puis on
// arrête d'observer). Garde-fou : si IntersectionObserver est absent, on renvoie
// true d'emblée → le contenu n'est jamais bloqué. L'état « caché » avant
// révélation est porté par le CSS, et uniquement en prefers-reduced-motion:
// no-preference + JS actif (cf. globals.css), donc sûr en mobile/dégradé.
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = "0px 0px -10% 0px",
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
