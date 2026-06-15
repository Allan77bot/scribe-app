"use client";

import { useState } from "react";
import { createEntry } from "@/lib/entries/actions";

export default function NoteInput() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("type", "text");
      fd.append("raw_text", trimmed);
      await createEntry(fd);
      // createEntry redirige : si on arrive ici sans redirect, rien à faire.
    } catch (err) {
      // Erreur affichée, jamais avalée (corrige le `catch {}` relevé par l'audit).
      // NB : un redirect Next lève une exception de contrôle — on l'ignore.
      const message = err instanceof Error ? err.message : "";
      if (message.includes("NEXT_REDIRECT")) throw err;
      setError("L'envoi a échoué. Réessayez dans un instant.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Écrivez votre note ici — Scribe en extrait les tâches…"
        disabled={loading}
        className="min-h-[120px] w-full resize-none rounded-field bg-surface-container-low p-3.5 text-base text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />
      {error && (
        <p className="rounded-field bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="flex h-14 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-primary"
      >
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
