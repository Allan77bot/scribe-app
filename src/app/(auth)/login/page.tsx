import Link from "next/link";
import { login } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-semibold text-slate-900">Se connecter</h1>
      <p className="mt-1 text-sm text-slate-500">
        Accède à la coordination de ton équipe.
      </p>

      {message === "confirm-email" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Compte créé. Confirme ton e-mail, puis connecte-toi.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={login} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">E-mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Mot de passe</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </label>
        <button
          type="submit"
          className="mt-1 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-800"
        >
          Se connecter
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline">
          Créer une équipe
        </Link>
      </p>
    </div>
  );
}
