"use client";

// DÉMO throwaway — compare 4 styles d'animation « quand on parle » pour l'orbe.
// Ici l'animation tourne en boucle (aperçu du STYLE) ; dans la vraie app, c'est
// le volume réel du micro qui la pilote. Pas de login. À jeter après le choix.

const RING_GRADIENT =
  "conic-gradient(from 0deg at 50% 50%, #67e8f9 0deg, #60a5fa 80deg, #818cf8 138deg, #e9d5ff 180deg, #c4b5fd 224deg, #a78bfa 286deg, #67e8f9 360deg)";
const RING_MASK =
  "radial-gradient(closest-side, transparent 0 84%, #000 89%, #000 92%, transparent 97%)";

const SIZE = 168; // px

// L'anneau de base (validé) : glow flouté + trait net néon.
function Ring() {
  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: RING_GRADIENT,
          WebkitMask: RING_MASK,
          mask: RING_MASK,
          filter: "blur(11px)",
          opacity: 0.6,
        }}
      />
      <div
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
  );
}

const VARIANTS = [
  {
    n: 1,
    name: "Pulsation",
    desc: "L'anneau gonfle et son glow s'intensifie au rythme de la voix. Classique, type Siri.",
    render: (
      <div style={{ animation: "orbprev-pulse 1.5s ease-in-out infinite" }}>
        <Ring />
      </div>
    ),
  },
  {
    n: 2,
    name: "Rotation",
    desc: "Le dégradé tourne autour de l'anneau — l'énergie circule. Hypnotique, vivant.",
    render: (
      <div style={{ animation: "orbprev-spin 6s linear infinite" }}>
        <Ring />
      </div>
    ),
  },
  {
    n: 3,
    name: "Échos",
    desc: "Des anneaux concentriques s'écartent depuis l'orbe à chaque salve de voix. Effet sonar / écoute.",
    render: (
      <div className="relative grid place-items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border"
            style={{
              width: SIZE,
              height: SIZE,
              borderColor: "rgba(129,140,248,0.55)",
              animation: `orbprev-echo 2.4s ease-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
        <Ring />
      </div>
    ),
  },
  {
    n: 4,
    name: "Aura vivante",
    desc: "Un grand halo flou respire fort autour de l'anneau. Doux, organique, ambiant.",
    render: (
      <div className="relative grid place-items-center">
        <div
          className="absolute rounded-full"
          style={{
            width: SIZE,
            height: SIZE,
            background: RING_GRADIENT,
            WebkitMask: RING_MASK,
            mask: RING_MASK,
            filter: "blur(22px)",
            animation: "orbprev-aura 2s ease-in-out infinite",
          }}
        />
        <Ring />
      </div>
    ),
  },
];

export default function OrbPreviewPage() {
  return (
    <main
      className="min-h-dvh px-5 py-10"
      style={{ background: "#070912", color: "#e7e9f3" }}
    >
      <style>{`
        @keyframes orbprev-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.075)} }
        @keyframes orbprev-spin  { to{transform:rotate(360deg)} }
        @keyframes orbprev-echo  { 0%{transform:scale(0.72);opacity:0.55} 100%{transform:scale(1.7);opacity:0} }
        @keyframes orbprev-aura  { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.35);opacity:0.7} }
        @media (prefers-reduced-motion: reduce) {
          [style*="orbprev-"] { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">Orbe — animations « quand on parle »</h1>
        <p className="mt-2 text-sm text-white/60">
          4 styles en aperçu (animation en boucle). Dans l&apos;app, c&apos;est ton volume réel
          qui pilotera l&apos;animation. Dis-moi le numéro que tu préfères — ou un mélange.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {VARIANTS.map((v) => (
            <div
              key={v.n}
              className="flex flex-col items-center rounded-2xl border border-white/10 p-6"
              style={{
                background:
                  "radial-gradient(circle at 50% 38%, rgba(20,26,48,0.9) 0%, rgba(7,9,18,0.95) 75%)",
              }}
            >
              <div className="flex h-56 w-full items-center justify-center">
                {v.render}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold">
                  <span style={{ color: "#67e8f9" }}>{v.n}.</span> {v.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
