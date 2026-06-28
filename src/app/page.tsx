import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />
      <main className="flex-1">{/* sections ajoutées aux tâches suivantes */}</main>
      <Footer />
    </div>
  );
}
