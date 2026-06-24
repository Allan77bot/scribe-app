import type { MetadataRoute } from "next";

// PWA installable. Servi automatiquement sur /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scribe — coordination d'équipe",
    short_name: "Scribe",
    description:
      "Transforme tes notes en coordination d'équipe : tâches, accusés de lecture, rapport de passation.",
    start_url: "/",
    display: "standalone",
    // Paper chaud du design system Scribe IA (plus de résidu sombre #0f172a).
    background_color: "#f8f7f4",
    theme_color: "#f8f7f4",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
