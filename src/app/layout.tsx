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
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  // Fond clair du design system (DESIGN.md §2.2 — surface #f7fafd).
  themeColor: "#f7fafd",
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
