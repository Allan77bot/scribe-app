import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pillars } from "@/components/landing/Pillars";
import { TrustBar } from "@/components/landing/TrustBar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Pillars />
        <TrustBar />
      </main>
      <Footer />
    </div>
  );
}
