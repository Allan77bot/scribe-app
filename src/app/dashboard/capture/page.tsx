"use client";

import { useState } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import NoteInput from "@/components/NoteInput";

type Tab = "vocal" | "ecrit";

export default function CapturePage() {
  const [tab, setTab] = useState<Tab>("vocal");

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-ink-900 text-cloud-50">
      <div className="w-full max-w-md px-5 pt-8 pb-10">
        <h1 className="text-xl font-semibold mb-6">Nouvelle note</h1>

        {/* Sélecteur d'onglets */}
        <div
          className="mb-8 flex overflow-hidden rounded-xl bg-ink-700"
          role="tablist"
        >
          {(["vocal", "ecrit"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-[44px] flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t ? "text-cloud-50" : "text-muted"
              }`}
              style={
                tab === t ? { background: "var(--gradient-accent)" } : undefined
              }
            >
              {t === "vocal" ? "Vocal" : "Écrit"}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet actif */}
        {tab === "vocal" ? <AudioRecorder /> : <NoteInput />}
      </div>
    </main>
  );
}
