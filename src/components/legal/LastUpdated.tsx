// Badge « dernière mise à jour » + version, en tête de chaque document légal.
export function LastUpdated({ date, version }: { date: string; version: string }) {
  return (
    <p className="eyebrow mb-8">
      Dernière mise à jour : {date} · v{version}
    </p>
  );
}
