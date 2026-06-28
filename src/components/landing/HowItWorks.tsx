// Le parcours en 3 temps (récit de la passation). Cible de l'ancre du hero.
const STEPS = [
  {
    n: 1,
    title: "Dictez en fin de poste",
    desc: "Vous parlez, Scribe écoute. Pas de saisie après huit heures debout.",
  },
  {
    n: 2,
    title: "L'IA propose, vous validez",
    desc: "Scribe sort les tâches de votre note. Vous validez avant que rien ne parte : rien ne se déclenche sans un humain.",
  },
  {
    n: 3,
    title: "La relève reçoit tout",
    desc: "L'équipe suivante ouvre une passation claire. Vous voyez qui a lu, et quoi.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="mx-auto w-full max-w-5xl scroll-mt-8 px-6 py-12 md:py-16"
    >
      <p className="eyebrow">Comment ça marche</p>
      <ol className="mt-6 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4 md:flex-col">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-extrabold text-on-primary">
              {s.n}
            </span>
            <div>
              <h2 className="text-lg font-bold text-secondary">{s.title}</h2>
              <p className="mt-1 leading-relaxed text-on-surface-variant">
                {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
