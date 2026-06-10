import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#0f172a",
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
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
