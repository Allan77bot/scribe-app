"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getSignedUploadUrl, createEntry } from "@/lib/entries/actions";

type RecState = "idle" | "recording" | "recorded" | "uploading" | "error";

const BAR_HEIGHTS = [0.4, 0.65, 1, 0.65, 0.4];

export default function AudioRecorder() {
  const [state, setState] = useState<RecState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const b = new Blob(chunksRef.current, { type: mime });
        blobRef.current = b;
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(b);
        });
        setState("recorded");
      };

      recorderRef.current = recorder;
      recorder.start();
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(
        () => setSeconds((s) => s + 1),
        1000,
      );
    } catch {
      setErrorMsg("Micro inaccessible. Vérifie les permissions du navigateur.");
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recorderRef.current?.stop();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!blobRef.current) return;
    setState("uploading");
    try {
      const { signedUrl, path } = await getSignedUploadUrl("recording");
      const res = await fetch(signedUrl, {
        method: "PUT",
        body: blobRef.current,
        headers: { "Content-Type": blobRef.current.type },
      });
      if (!res.ok) throw new Error(`Upload échoué (${res.status})`);

      const fd = new FormData();
      fd.append("type", "audio");
      fd.append("storage_path", path);
      await createEntry(fd);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    blobRef.current = null;
    setSeconds(0);
    setErrorMsg("");
    setState("idle");
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── État erreur ─────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-sm text-center" style={{ color: "#F0E8D6" }}>
          {errorMsg}
        </p>
        <button
          onClick={reset}
          className="rounded-xl px-6 py-3 text-sm font-medium min-h-[44px]"
          style={{ background: "#6E1F2C", color: "#F0E8D6" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ── État upload en cours ─────────────────────────────────────────────────
  if (state === "uploading") {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "#A8804D", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#F0E8D6", opacity: 0.6 }}>
          Envoi en cours…
        </p>
      </div>
    );
  }

  // ── État enregistrement terminé — prévisualisation ───────────────────────
  if (state === "recorded" && audioUrl) {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <audio src={audioUrl} controls className="w-full" />
        <div className="flex gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 rounded-xl py-3 text-sm font-medium min-h-[44px] border"
            style={{
              borderColor: "#A8804D",
              color: "#A8804D",
              background: "transparent",
            }}
          >
            Recommencer
          </button>
          <button
            onClick={handleUpload}
            className="flex-1 rounded-xl py-3 text-sm font-medium min-h-[44px]"
            style={{ background: "#6E1F2C", color: "#F0E8D6" }}
          >
            Envoyer
          </button>
        </div>
      </div>
    );
  }

  // ── États idle + recording ───────────────────────────────────────────────
  return (
    <>
      {/* Keyframes pour les barres audio animées */}
      <style>{`
        @keyframes bar-breathe {
          from { transform: scaleY(0.4); opacity: 0.6; }
          to   { transform: scaleY(1);   opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col items-center gap-6 py-8">
        {state === "recording" && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-end gap-1"
              style={{ height: 48 }}
              aria-hidden
            >
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full"
                  style={{
                    height: `${h * 48}px`,
                    background: "#6E1F2C",
                    transformOrigin: "bottom",
                    animation: `bar-breathe 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <p
              className="text-2xl font-mono tabular-nums"
              style={{ color: "#F0E8D6" }}
            >
              {fmt(seconds)}
            </p>
          </div>
        )}

        {/* Bouton principal micro / stop */}
        <button
          onClick={state === "idle" ? startRecording : stopRecording}
          className="rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{
            width: 80,
            height: 80,
            minWidth: 80,
            background: state === "recording" ? "#6E1F2C" : "#A8804D",
            color: "#F0E8D6",
          }}
          aria-label={
            state === "idle"
              ? "Commencer l'enregistrement"
              : "Arrêter l'enregistrement"
          }
        >
          {state === "idle" ? (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          )}
        </button>

        <p className="text-sm" style={{ color: "#F0E8D6", opacity: 0.5 }}>
          {state === "idle"
            ? "Appuyer pour enregistrer"
            : "Appuyer pour arrêter"}
        </p>
      </div>
    </>
  );
}
