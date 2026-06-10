import Link from "next/link";
import { signup } from "@/lib/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-semibold text-slate-900">Créer une équipe</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tu deviens administrateur de ton organisation.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={signup} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Nom de l&apos;équipe
          </span>
          <input
            type="text"
            name="org_name"
            required
            placeholder="Ex. Réception Hôtel Meaux"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Ton nom</span>
          <input
            type="text"
            name="display_name"
            autoComplete="name"
            placeholder="Ex. Allan"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </label>
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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </label>
        <button
          type="submit"
          className="mt-1 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-800"
        >
          Créer mon équipe
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
