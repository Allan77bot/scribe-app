// Réutilise le même rendu que l'Open Graph (carte summary_large_image).
// `runtime` doit être déclaré localement : Turbopack ne sait pas le résoudre
// quand il est ré-exporté depuis un autre module (il doit être statiquement lisible).
export const runtime = "nodejs";
export { default, alt, size, contentType } from "./opengraph-image";
