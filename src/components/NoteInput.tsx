"use client";

import { useState } from "react";
import { createEntry } from "@/lib/entries/actions";
import { Button } from "@/components/ui/Button";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Écrivez votre note ici — Scribe en extrait les tâches…"
        disabled={loading}
        rows={6}
        className="min-h-[160px] w-full resize-none rounded-field bg-surface-container-low p-4 text-base leading-relaxed text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />

      <p className="text-xs text-on-surface-variant">
        Scribe vous proposera les tâches ; rien n&apos;est lancé sans votre
        confirmation.
      </p>

      {error && (
        <p className="rounded-field bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={!text.trim() || loading}
      >
        {loading ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  );
}
