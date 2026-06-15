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
        <p className="w-full rounded-field bg-error-container px-4 py-3 text-center text-sm text-on-error-container">
          {errorMsg}
        </p>
        <button
          onClick={reset}
          className="flex h-14 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
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
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary"
          style={{ borderTopColor: "transparent" }}
        />
        <p className="text-sm text-on-surface-variant">Envoi en cours…</p>
      </div>
    );
  }

  // ── État enregistrement terminé — prévisualisation ───────────────────────
  if (state === "recorded" && audioUrl) {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <audio src={audioUrl} controls className="w-full" />
        <div className="flex w-full gap-3">
          <button
            onClick={reset}
            className="flex h-14 flex-1 items-center justify-center rounded-pill bg-azure px-6 text-base font-semibold text-primary transition-all hover:brightness-95 active:scale-[0.98]"
          >
            Recommencer
          </button>
          <button
            onClick={handleUpload}
            className="flex h-14 flex-1 items-center justify-center rounded-pill bg-primary px-6 text-base font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
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
                  className="w-2 rounded-full bg-primary"
                  style={{
                    height: `${h * 48}px`,
                    transformOrigin: "bottom",
                    animation: `bar-breathe 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-2xl tabular-nums text-secondary">
              {fmt(seconds)}
            </p>
          </div>
        )}

        {/* Bouton principal micro / stop */}
        <button
          onClick={state === "idle" ? startRecording : stopRecording}
          className={`flex size-16 items-center justify-center rounded-full transition-transform active:scale-95 ${
            // Enregistrement = error (signal d'arrêt) ; repos = primary.
            state === "recording"
              ? "bg-error text-on-error"
              : "bg-primary text-on-primary"
          }`}
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

        <p className="text-sm text-on-surface-variant">
          {state === "idle"
            ? "Appuyer pour enregistrer"
            : "Appuyer pour arrêter"}
        </p>
      </div>
    </>
  );
}
