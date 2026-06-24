import Link from "next/link";

// DÉMO — index des écrans prévisualisables sans login.
const SCREENS = [
  {
    href: "/demo/onboarding",
    title: "Onboarding (version actuelle)",
    desc: "Le wizard « trop simplet » qu'on va refaire ensemble",
  },
  {
    href: "/demo/dashboard",
    title: "Dashboard + guide des onglets",
    desc: "Le guide « première fois » qui explique chaque onglet de la barre du bas",
  },
  {
    href: "/demo/tasks",
    title: "Tâches — assignation & suivi",
    desc: "Initiales (AM, SD…), assignation, création manuelle, filtre par personne, vue Manager/Employé",
  },
  {
    href: "/demo/capture",
    title: "Capturer — l'enregistreur",
    desc: "Montre la correction : la note n'est jamais perdue si l'envoi échoue",
  },
];

export default function DemoIndex() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-xl font-semibold text-secondary">Démo Scribe</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Prévisualisation sans login. Données fictives, aucun appel réel.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {SCREENS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-card bg-card p-5 shadow-card transition-all hover:brightness-95 active:scale-[0.98]"
          >
            <p className="text-sm font-semibold text-secondary">{s.title}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
