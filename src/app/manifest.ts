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
    background_color: "#0f172a",
    theme_color: "#0f172a",
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
