import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
