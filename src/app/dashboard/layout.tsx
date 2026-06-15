import DashboardNav from "@/components/DashboardNav";

// Layout commun à toutes les pages du dashboard : applique le fond clair du
// design system, centre le contenu sur une largeur max de 1200px (DESIGN.md §4)
// et réserve l'espace bas pour la barre de navigation fixe.
// `pb-24` garantit que le dernier contenu n'est jamais masqué par la nav.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-[1200px] pb-24">{children}</div>
      <DashboardNav />
    </div>
  );
}
