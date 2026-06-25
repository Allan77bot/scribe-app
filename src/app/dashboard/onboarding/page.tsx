import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "@/components/OnboardingWizard";

type Org = { name: string; onboarding_complete: boolean };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Lecture défensive : onboarding_complete peut manquer (migration 0006 non
  // appliquée en prod). Si la colonne est absente, on traite comme si
  // l'onboarding n'était pas encore fait — l'utilisateur voit le wizard.
  let org: Org | undefined;
  try {
    const { data: profile, error } = await supabase
      .from("users")
      .select("organizations(name, onboarding_complete)")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    org = profile?.organizations as unknown as Org | undefined;
  } catch {
    // Colonne onboarding_complete absente → fallback : onboarding pas encore fait.
    const { data: profile } = await supabase
      .from("users")
      .select("organizations(name)")
      .eq("id", user.id)
      .maybeSingle();
    const raw = profile?.organizations as unknown as { name: string } | undefined;
    org = raw ? { name: raw.name, onboarding_complete: false } : undefined;
  }

  // Déjà terminé → on n'impose pas le wizard à nouveau.
  if (org?.onboarding_complete) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-10">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-secondary">Bienvenue dans Scribe</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Trois étapes pour transformer la parole de votre équipe en
            coordination claire.
          </p>
        </header>
        <OnboardingWizard initialOrgName={org?.name ?? ""} />
      </div>
    </main>
  );
}
