import TaskValidationCard, { type Task } from "@/components/TaskValidationCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

// Aperçu PUBLIC (sans login) des composants du design system Scribe IA, rendus
// en réel. Sert de preuve visuelle + galerie de composants pendant le rollout.
// Jetable comme le reste de /demo. Les boutons de la carte appellent de vraies
// server actions → ne pas cliquer ici (pas de session/donnée).
const SAMPLES: Task[] = [
  {
    entryId: "demo",
    taskIndex: 0,
    title: "Recaler la palette 7 avant la relève de 14h",
    priority: "haute",
    assignee_suggestion: "Sofiane",
    deadline_suggestion: "Avant 14:00",
    status: "proposed",
    assignee: null,
  },
  {
    entryId: "demo",
    taskIndex: 1,
    title: "Vérifier le stock de films étirables au quai B",
    priority: "moyenne",
    assignee_suggestion: "Équipe jour",
    deadline_suggestion: "Aujourd'hui",
    status: "validated",
    assignee: null,
  },
  {
    entryId: "demo",
    taskIndex: 2,
    title: "Signaler le transpalette HS à la maintenance",
    priority: "basse",
    assignee_suggestion: null,
    deadline_suggestion: null,
    status: "done",
    assignee: null,
  },
  {
    entryId: "demo",
    taskIndex: 3,
    title: "Doublon — déjà traité par l'équipe de nuit",
    priority: "basse",
    assignee_suggestion: null,
    deadline_suggestion: null,
    status: "rejected",
    assignee: null,
  },
];

export default function DesignPreview() {
  return (
    <main className="min-h-screen bg-surface px-5 py-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        <header>
          <p className="eyebrow">Design system · Scribe IA</p>
          <h1 className="text-xl font-semibold text-secondary">
            Aperçu des composants
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Rendu réel des composants DS. La carte de validation est le vrai
            composant produit — ne clique pas (pas de session ici).
          </p>
        </header>

        <section className="space-y-3">
          <p className="eyebrow">StatusBadge · le cyan signe « Active »</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="proposed" />
            <StatusBadge status="validated" />
            <StatusBadge status="done" />
            <StatusBadge status="rejected" />
          </div>
        </section>

        <section className="space-y-3">
          <p className="eyebrow">Button · pilule, ≥ 44px</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="text">Text</Button>
            <Button variant="danger">Rejeter</Button>
          </div>
          <Button size="lg" fullWidth>
            Action principale (56px)
          </Button>
        </section>

        <section className="space-y-3">
          <p className="eyebrow">Carte de validation (composant réel)</p>
          {SAMPLES.map((t) => (
            <TaskValidationCard key={t.taskIndex} task={t} />
          ))}
        </section>
      </div>
    </main>
  );
}
