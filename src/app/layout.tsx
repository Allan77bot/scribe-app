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
  // Paper chaud du design system Scribe IA (surface #f8f7f4).
  themeColor: "#f8f7f4",
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
        {children}
      </body>
    </html>
  );
}
