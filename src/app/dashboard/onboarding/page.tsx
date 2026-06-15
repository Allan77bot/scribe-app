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

  // RLS : on ne lit que sa propre org.
  const { data: profile } = await supabase
    .from("users")
    .select("organizations(name, onboarding_complete)")
    .eq("id", user.id)
    .maybeSingle();

  const org = profile?.organizations as unknown as Org | undefined;

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
