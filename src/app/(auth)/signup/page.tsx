import Link from "next/link";
import { signup } from "@/lib/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="rounded-card bg-card p-6 shadow-card">
      <h1 className="text-xl font-semibold text-secondary">Créer une équipe</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Tu deviens administrateur de ton organisation.
      </p>

      {error && (
        <p className="mt-4 rounded-field bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <form action={signup} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface-variant">
            Nom de l&apos;équipe
          </span>
          <input
            type="text"
            name="org_name"
            required
            maxLength={120}
            placeholder="Ex. Réception Hôtel Meaux"
            className="w-full rounded-field bg-surface-container-low px-3 py-2.5 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface-variant">Ton nom</span>
          <input
            type="text"
            name="display_name"
            autoComplete="name"
            maxLength={80}
            placeholder="Ex. Allan"
            className="w-full rounded-field bg-surface-container-low px-3 py-2.5 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface-variant">E-mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-field bg-surface-container-low px-3 py-2.5 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface-variant">Mot de passe</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-field bg-surface-container-low px-3 py-2.5 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <button
          type="submit"
          className="mt-1 flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
        >
          Créer mon équipe
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-on-surface-variant">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
