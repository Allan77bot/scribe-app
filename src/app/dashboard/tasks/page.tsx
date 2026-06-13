export default function TasksPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5">
      <div className="text-center">
        <p className="text-5xl">✓</p>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">Tâches</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les tâches extraites de tes notes apparaîtront ici après validation.
        </p>
        <button
          disabled
          className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white opacity-50"
        >
          À venir
        </button>
      </div>
    </main>
  );
}
