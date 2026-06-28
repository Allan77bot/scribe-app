// Pourquoi Scribe : 3 différenciateurs (bénéfices, pas étapes). Bande distincte.
const PILLARS = [
  {
    icon: "✅",
    title: "Vous gardez la main",
    desc: "L'IA propose, vous décidez. Aucune relance ne part sans votre validation.",
  },
  {
    icon: "🧠",
    title: "La mémoire de l'équipe",
    desc: "Tâches, accusés de lecture, rapport de passation : ce que vous dictez à 22h est là à 6h.",
  },
  {
    icon: "🎙️",
    title: "Zéro friction",
    desc: "On dicte sur son téléphone en trente secondes. Pas de formation, pas de logiciel lourd.",
  },
];

export function Pillars() {
  return (
    <section className="bg-surface-dim">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
        <p className="eyebrow">Pourquoi Scribe</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-lg border border-outline-variant bg-card p-5 shadow-card"
            >
              <span className="text-2xl" aria-hidden>
                {p.icon}
              </span>
              <h2 className="mt-3 text-base font-bold text-secondary">
                {p.title}
              </h2>
              <p className="mt-1 leading-relaxed text-on-surface-variant">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
