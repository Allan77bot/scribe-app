"use client";

import { useState } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import NoteInput from "@/components/NoteInput";

type Tab = "vocal" | "ecrit";

export default function CapturePage() {
  const [tab, setTab] = useState<Tab>("vocal");

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-surface text-on-surface">
      <div className="w-full max-w-md px-5 pt-8 pb-10">
        <p className="eyebrow mb-1.5">Capture</p>
        <h1 className="mb-6 text-2xl font-semibold text-secondary">
          Nouvelle note
        </h1>

        {/* Segmented control — onglet actif posé en blanc, inactif discret. */}
        <div
          className="mb-8 flex rounded-pill bg-surface-container p-1"
          role="tablist"
        >
          {(["vocal", "ecrit"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-[44px] flex-1 rounded-pill text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white text-primary shadow-card"
                  : "text-on-surface-variant"
              }`}
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
