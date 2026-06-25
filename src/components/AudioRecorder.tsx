"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getSignedUploadUrl, createEntry } from "@/lib/entries/actions";
import { savePending, loadPending, clearPending } from "@/lib/audio/pending";
import { Button } from "@/components/ui/Button";

type RecState = "idle" | "recording" | "recorded" | "uploading" | "error";

// ── Waveform live (FEATURE 3) ─────────────────────────────────────────────
// 7 barres dont la hauteur suit le volume réel du micro (Web Audio API). Le
// rendu est piloté en direct via des refs DOM dans une boucle requestAnimation-
// Frame → aucun re-render React à 60 fps (cf. bonnes pratiques perf).
const BAR_COUNT = 7;
const MAX_BAR_HEIGHT = 48; // px — hauteur du conteneur
const MIN_RATIO = 0.05; // silence = 5 % (les barres ne disparaissent jamais)

// Couleur des barres par niveau, calée sur les tokens DS « Scribe IA ».
// On lit les variables CSS au runtime → la waveform suit toujours le thème :
// primary (cobalt) au calme, cyan quand la voix monte, error à la saturation.
const cssVar = (name: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
};

function levelColor(level: number): string {
  if (level >= 0.9) return cssVar("--color-error", "#dc2626"); // saturation
  if (level >= 0.5) return cssVar("--color-cyan", "#22d3ee"); // voix soutenue
  return cssVar("--color-primary", "#2a4fb0"); // voix normale
}

export default function AudioRecorder() {
  const [state, setState] = useState<RecState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  // true quand on a restauré un enregistrement non envoyé (récupéré d'IndexedDB).
  const [recovered, setRecovered] = useState(false);
  // Reflète la présence d'un blob (le ref ne se lit pas pendant le rendu).
  const [hasRecording, setHasRecording] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs audio + animation.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  const startMeter = useCallback((stream: MediaStream) => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return; // pas de Web Audio → on reste sans waveform, sans crash
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128; // 64 bins — assez fin pour la voix
    analyser.smoothingTimeConstant = 0.8; // lissage temporel (mouvement fluide)
    source.connect(analyser); // jamais vers destination (pas de larsen)

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    const data = new Uint8Array(analyser.frequencyBinCount);
    dataRef.current = data;

    // Boucle d'animation : lit le spectre, le replie en 4 bandes (grave → aigu)
    // affichées en miroir autour du centre → silhouette de voix symétrique.
    const loop = () => {
      analyser.getByteFrequencyData(data);

      const usable = Math.floor(data.length * 0.45); // bande de la voix (grave)
      const bandSize = Math.max(1, Math.floor(usable / 4));
      const bands = [0, 1, 2, 3].map((b) => {
        let sum = 0;
        for (let i = b * bandSize; i < (b + 1) * bandSize; i++) sum += data[i];
        // Gain doux : l'entrée micro est souvent basse, on la rend vivante.
        return Math.min(1, (sum / bandSize / 255) * 1.6);
      });

      for (let i = 0; i < BAR_COUNT; i++) {
        const el = barsRef.current[i];
        if (!el) continue;
        const level = bands[Math.abs(i - 3)]; // centre = grave (le plus fort)
        const ratio = Math.max(MIN_RATIO, level);
        el.style.height = `${ratio * MAX_BAR_HEIGHT}px`;
        el.style.backgroundColor = levelColor(level);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopMeter = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current = null;
    dataRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  // Nettoyage global à la sortie du composant.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMeter();
    };
  }, [stopMeter]);

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
        stopMeter();
        stream.getTracks().forEach((t) => t.stop());
        const b = new Blob(chunksRef.current, { type: mime });
        blobRef.current = b;
        // Persiste tout de suite (IndexedDB) : si l'upload échoue ou la page se
        // recharge en zone sans réseau, l'enregistrement n'est PAS perdu.
        void savePending(b);
        setHasRecording(true);
        setRecovered(false);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(b);
        });
        setState("recorded");
      };

      recorderRef.current = recorder;
      recorder.start();
      startMeter(stream); // waveform branchée sur le même flux
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setErrorMsg("Micro inaccessible. Vérifiez les permissions du navigateur.");
      setState("error");
    }
  }, [startMeter, stopMeter]);

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

      // L'audio est dans le storage → l'enregistrement est safe, on purge le cache.
      await clearPending();

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

  // Jeter l'enregistrement (Recommencer / Supprimer) → purge aussi le cache offline.
  const reset = useCallback(() => {
    stopMeter();
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    blobRef.current = null;
    void clearPending();
    setHasRecording(false);
    setRecovered(false);
    setSeconds(0);
    setErrorMsg("");
    setState("idle");
  }, [stopMeter]);

  // Récupération : au montage, si un enregistrement non envoyé traîne en cache
  // (upload échoué / page rechargée en zone sans réseau), on le restaure pour
  // pouvoir le renvoyer — il n'est jamais perdu.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pend = await loadPending();
      if (cancelled || !pend || blobRef.current) return;
      blobRef.current = pend.blob;
      setAudioUrl(URL.createObjectURL(pend.blob));
      setHasRecording(true);
      setRecovered(true);
      setState((s) => (s === "idle" ? "recorded" : s));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Renvoi automatique au retour du réseau, quand un envoi avait échoué.
  useEffect(() => {
    if (state !== "error") return;
    const onOnline = () => {
      if (blobRef.current) void handleUpload();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [state, handleUpload]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── État erreur ─────────────────────────────────────────────────────────
  if (state === "error") {
    // Si un enregistrement existe encore (échec d'upload), on propose de RENVOYER
    // sans jamais effacer le blob — on ne perd pas la passation. Sinon (erreur
    // micro), simple retour à l'état initial.
    const canRetryUpload = hasRecording;
    return (
      <div className="flex flex-col items-center gap-4 rounded-card bg-card p-6 shadow-card">
        <p className="w-full rounded-field bg-error-container px-4 py-3 text-center text-sm text-on-error-container">
          {errorMsg}
        </p>
        {canRetryUpload ? (
          <>
            <p className="text-center text-xs text-on-surface-variant">
              Votre enregistrement est conservé. Réessayez l&apos;envoi.
            </p>
            <div className="flex w-full gap-3">
              <Button variant="danger" size="lg" fullWidth onClick={reset}>
                Supprimer
              </Button>
              <Button size="lg" fullWidth onClick={handleUpload}>
                Réessayer l&apos;envoi
              </Button>
            </div>
          </>
        ) : (
          <Button size="lg" onClick={reset}>
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  // ── État upload en cours ─────────────────────────────────────────────────
  if (state === "uploading") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card bg-card p-10 shadow-card">
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
      <div className="flex flex-col gap-5 rounded-card bg-card p-6 shadow-card">
        {recovered && (
          <p className="w-full rounded-field bg-azure px-4 py-3 text-center text-sm text-primary">
            Enregistrement non envoyé récupéré. Vous pouvez l&apos;envoyer
            maintenant.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <p className="eyebrow">Votre enregistrement</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
        <div className="flex w-full gap-3">
          <Button variant="secondary" size="lg" fullWidth onClick={reset}>
            Recommencer
          </Button>
          <Button size="lg" fullWidth onClick={handleUpload}>
            Envoyer
          </Button>
        </div>
      </div>
    );
  }

  // ── États idle + recording ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-7 rounded-card bg-card p-8 shadow-card">
      {state === "recording" && (
        <div className="flex flex-col items-center gap-4">
          {/* Waveform live — hauteurs/couleurs pilotées par la boucle loop().
              Barres de fond posées sur bg-surface-container ; au repos primary,
              cyan/error quand la voix monte (cf. levelColor + tokens DS). */}
          <div
            className="flex items-end justify-center gap-1.5 rounded-field bg-surface-container px-4 py-3"
            style={{ height: MAX_BAR_HEIGHT + 24 }}
            aria-hidden
          >
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  barsRef.current[i] = el;
                }}
                className="w-2 rounded-full bg-primary"
                style={{
                  height: `${MIN_RATIO * MAX_BAR_HEIGHT}px`,
                  transition: "height 100ms ease-out",
                }}
              />
            ))}
          </div>
          <p className="tnum text-3xl font-semibold text-secondary">
            {fmt(seconds)}
          </p>
        </div>
      )}

      {/* Bouton principal micro / stop — action principale, cible 64px. */}
      <button
        onClick={state === "idle" ? startRecording : stopRecording}
        className={`flex size-20 items-center justify-center rounded-full shadow-card transition-transform active:scale-95 ${
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
          ? "Appuyez pour enregistrer"
          : "Appuyez pour arrêter"}
      </p>
    </div>
  );
}
