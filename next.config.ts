import type { NextConfig } from "next";

// FAILLE AS-21 (audit 2026-06-27) — aucun header de sécurité n'était émis.
// On ajoute une politique transversale (toutes routes). La CSP reste volontairement
// permissive sur script/style ('unsafe-inline') car Next 16 injecte des scripts/styles
// inline sans nonce ; elle verrouille en revanche default-src, les frames, les objets,
// la base-uri et les origines réseau. `microphone=(self)` est INDISPENSABLE : le module
// d'enregistrement vocal utilise getUserMedia(audio) — ne jamais le retirer.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "media-src 'self' blob:",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // 2 ans, sous-domaines inclus. Sans effet en local (HTTP), actif derrière HTTPS (Vercel).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Surface d'API navigateur minimale. microphone=(self) requis pour l'enregistrement vocal.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Ne pas divulguer la stack (header X-Powered-By: Next.js) — faille AS-21.
  poweredByHeader: false,
  images: {
    // Photos de profil servies depuis le bucket public Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
