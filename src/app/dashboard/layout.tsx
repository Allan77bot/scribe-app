import DashboardNav from "@/components/DashboardNav";

// Layout commun à toutes les pages du dashboard : applique le fond sombre du
// design system et réserve l'espace bas pour la barre de navigation fixe.
// `pb-24` garantit que le dernier contenu n'est jamais masqué par la nav.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#0A0708" }}>
      <div className="pb-24">{children}</div>
      <DashboardNav />
    </div>
  );
}
