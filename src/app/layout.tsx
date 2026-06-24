import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Police unique du design system « Professional Flow » (DESIGN.md §3).
// Graisses 400 / 500 / 600 / 700 / 800 chargées, exposées en variable CSS.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scribe — coordination d'équipe",
  description:
    "Transforme tes notes vocales et écrites en coordination d'équipe : tâches suivies, accusés de lecture, rapport de passation automatique.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Scribe",
    statusBarStyle: "default",
  },
  // Icônes servies par les conventions de fichiers Next : src/app/icon.svg
  // (favicon vectoriel net) + src/app/apple-icon.png (180px). PWA : manifest.ts.
};

export const viewport: Viewport = {
  // Chrome navigateur : paper en clair, marine en sombre (dark mode shifts de nuit).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#12132a" },
  ],
  width: "device-width",
  initialScale: 1,
  // Mobile-first strict : on évite le zoom involontaire sur les formulaires.
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full antialiased ${manrope.variable}`}>
      <body className="flex min-h-full flex-col bg-surface text-on-surface">
        {/* Anti-flash : applique data-theme (stocké ou préférence système) avant
            le premier rendu, pour éviter un flash clair sur un shift de nuit. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
