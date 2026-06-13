"use client";

import { useState } from "react";
import { createEntry } from "@/lib/entries/actions";

export default function NoteInput() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", "text");
      fd.append("raw_text", trimmed);
      await createEntry(fd);
    } catch {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Écris ta note ici…"
        disabled={loading}
        className="w-full rounded-xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-amber-700 disabled:opacity-50"
        style={{
          minHeight: 120,
          background: "#1A1214",
          color: "#F0E8D6",
          border: "1px solid #A8804D",
        }}
      />
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="rounded-xl py-3 text-sm font-medium transition-opacity disabled:opacity-40 min-h-[44px]"
        style={{ background: "#6E1F2C", color: "#F0E8D6" }}
      >
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
