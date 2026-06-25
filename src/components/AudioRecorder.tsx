"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getSignedUploadUrl, createEntry } from "@/lib/entries/actions";
import { savePending, loadPending, clearPending } from "@/lib/audio/pending";
import { Button } from "@/components/ui/Button";

type RecState = "idle" | "recording" | "recorded" | "uploading" | "error";

// ── Orbe de capture vocale ────────────────────────────────────────────────
// L'orbe = un ANNEAU lumineux (centre vide), dégradé cyan→bleu→violet, sur un
// stage sombre pour faire ressortir le néon. Pendant l'enregistrement, l'anneau
// se dilate et son bloom s'intensifie au volume RÉEL du micro (Web Audio API),
// piloté en direct via des refs DOM dans une boucle requestAnimationFrame →
// aucun re-render React à 60 fps. Pas de WebGL : tourne sur tout mobile.

// Dégradé conique de l'anneau : cyan (haut) → bleu → violet clair (bas, le plus
// lumineux) → violet → cyan. Le centre est rendu transparent par un masque.
const RING_GRADIENT =
  "conic-gradient(from 0deg at 50% 50%, #67e8f9 0deg, #60a5fa 80deg, #818cf8 138deg, #e9d5ff 180deg, #c4b5fd 224deg, #a78bfa 286deg, #67e8f9 360deg)";
// Masque « anneau fin » : ne révèle qu'un trait circulaire fin près du bord
// (grand centre vide). Le même masque sert au trait net ET au glow flouté.
const RING_MASK =
  "radial-gradient(closest-side, transparent 0 84%, #000 89%, #000 92%, transparent 97%)";

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
  // Éléments de l'orbe pilotés en direct (sans re-render).
  const orbCoreRef = useRef<HTMLDivElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);

  const startMeter = useCallback((stream: MediaStream) => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return; // pas de Web Audio → l'orbe reste statique, sans crash
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

    // Boucle d'animation : moyenne la bande de la voix en un niveau global
    // (0 → 1), puis dilate le cœur de l'orbe et fait respirer un halo coloré.
    const loop = () => {
      analyser.getByteFrequencyData(data);

      const usable = Math.floor(data.length * 0.6); // bande voix (grave→médium)
      let sum = 0;
      for (let i = 0; i < usable; i++) sum += data[i];
      // Gain doux : l'entrée micro est souvent basse, on la rend vivante.
      const level = Math.min(1, (sum / usable / 255) * 1.9);

      const core = orbCoreRef.current;
      const halo = haloRef.current;
      // L'anneau se dilate et son bloom s'intensifie quand la voix monte.
      if (core) core.style.transform = `scale(${1 + level * 0.14})`;
      if (halo) halo.style.opacity = String(0.55 + level * 0.45);

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
      startMeter(stream); // orbe branché sur le même flux micro
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

  // ── États idle + recording — l'ORBE ──────────────────────────────────────
  const recording = state === "recording";
  return (
    <div className="flex flex-col items-center gap-8 rounded-card bg-card p-8 shadow-card">
      {/* Chrono visible uniquement pendant l'enregistrement. */}
      {recording && (
        <p className="tnum text-3xl font-semibold text-secondary">
          {fmt(seconds)}
        </p>
      )}

      {/* L'orbe : un ANNEAU néon (centre vide) sur un stage sombre, sans icône.
          Tap pour démarrer/arrêter. Au repos : respiration + bloom qui pulse
          (CSS). Recording : scale de l'anneau + bloom pilotés par loop() au
          volume réel du micro. */}
      <div className="relative flex size-64 items-center justify-center">
        {/* Échos : ondes concentriques qui s'écartent quand on parle. */}
        {recording &&
          [0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute size-52 rounded-full border"
              style={{
                borderColor: "rgba(129,140,248,0.5)",
                animation: `orb-echo 2.4s ease-out ${i * 0.8}s infinite`,
              }}
            />
          ))}

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="relative rounded-full outline-none transition-transform active:scale-95 focus-visible:ring-4 focus-visible:ring-cyan/60"
          aria-label={
            recording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"
          }
        >
          <div
            ref={orbCoreRef}
            className={`relative size-52 ${
              recording ? "" : "animate-[orb-breathe_6s_ease-in-out_infinite]"
            }`}
          >
            {/* Glow : le MÊME trait fin, flouté → halo néon qui épouse l'anneau
                (pas une bande large). Pulse au volume (ref). */}
            <div
              ref={haloRef}
              aria-hidden
              className={`absolute inset-0 rounded-full ${
                recording ? "" : "animate-[orb-halo-idle_5s_ease-in-out_infinite]"
              }`}
              style={{
                background: RING_GRADIENT,
                WebkitMask: RING_MASK,
                mask: RING_MASK,
                filter: "blur(11px)",
                opacity: 0.6,
              }}
            />
            {/* Anneau NET : trait fin coloré + néon serré (drop-shadow). */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background: RING_GRADIENT,
                WebkitMask: RING_MASK,
                mask: RING_MASK,
                filter:
                  "blur(0.5px) drop-shadow(0 0 5px rgba(96,165,250,0.7)) drop-shadow(0 0 12px rgba(167,139,250,0.45))",
              }}
            />
          </div>
        </button>
      </div>

      <p className="text-sm text-on-surface-variant">
        {recording ? "Appuyez pour arrêter" : "Appuyez pour parler"}
      </p>
    </div>
  );
}
