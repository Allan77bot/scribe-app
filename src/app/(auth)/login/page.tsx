import Link from "next/link";
import { login } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="rounded-card bg-card p-6 shadow-card">
      <h1 className="text-xl font-semibold text-secondary">Se connecter</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Accède à la coordination de ton équipe.
      </p>

      {message === "confirm-email" && (
        <p className="mt-4 rounded-field bg-azure px-3 py-2 text-sm text-on-azure">
          Compte créé. Confirme ton e-mail, puis connecte-toi.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-field bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <form action={login} className="mt-5 flex flex-col gap-4">
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
            autoComplete="current-password"
            className="w-full rounded-field bg-surface-container-low px-3 py-2.5 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <button
          type="submit"
          className="mt-1 flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
        >
          Se connecter
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-on-surface-variant">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-primary underline">
          Créer une équipe
        </Link>
      </p>
    </div>
  );
}
