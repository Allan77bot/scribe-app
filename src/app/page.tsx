import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pillars } from "@/components/landing/Pillars";
import { TrustBar } from "@/components/landing/TrustBar";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/Footer";

// Surcharge le <title>/description pour l'accueil. L'openGraph/twitter restent
// hérités de layout.tsx (le test og-meta reste vert).
export const metadata: Metadata = {
  title: "Scribe — Rien ne se perd entre les équipes",
  description:
    "Dictez vos notes de fin de poste : l'IA en sort les tâches, votre équipe valide, et la relève reçoit tout. Coordination pour les équipes en relais 3×8. Données en Europe.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Pillars />
        <TrustBar />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
