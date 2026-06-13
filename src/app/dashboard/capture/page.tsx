"use client";

import { useState } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import NoteInput from "@/components/NoteInput";

type Tab = "vocal" | "ecrit";

export default function CapturePage() {
  const [tab, setTab] = useState<Tab>("vocal");

  return (
    <main
      className="min-h-screen flex flex-col items-center overflow-x-hidden"
      style={{ background: "#0A0708", color: "#F0E8D6" }}
    >
      <div className="w-full max-w-md px-5 pt-8 pb-10">
        <h1 className="text-xl font-semibold mb-6">Nouvelle note</h1>

        {/* Sélecteur d'onglets */}
        <div
          className="flex rounded-xl overflow-hidden mb-8"
          role="tablist"
          style={{ background: "#1A1214" }}
        >
          {(["vocal", "ecrit"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm font-medium transition-colors min-h-[44px]"
              style={
                tab === t
                  ? { background: "#6E1F2C", color: "#F0E8D6" }
                  : { background: "transparent", color: "#F0E8D6", opacity: 0.45 }
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
