// Logo Scribe IA — mark officiel (S angulaire géométrique, cobalt + pointes cyan)
// + mot-marque. Source : projet Claude Design « Scribe IA Design System »
// (assets/logos, détourés). Deux variantes selon le thème : color (clair) /
// white-cyan (dark mode marine), basculées via CSS (.logo-light/.logo-dark,
// pilotés par html[data-theme] — cf. globals.css).

const MARK_RATIO = 237 / 308; // largeur / hauteur du mark détouré

export function ScribeMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const width = Math.round(size * MARK_RATIO);
  return (
    <span
      role="img"
      aria-label="Scribe IA"
      className={`inline-block shrink-0 ${className ?? ""}`}
      style={{ height: size, width }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/scribe-mark-color.png"
        alt=""
        aria-hidden
        className="logo-light h-full w-full object-contain"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/scribe-mark-white.png"
        alt=""
        aria-hidden
        className="logo-dark h-full w-full object-contain"
      />
    </span>
  );
}

// Lockup horizontal : mark + mot-marque « Scribe IA » (« IA » en cobalt).
// Casse phrase, graisse 800, tracking serré (guideline de marque du DS).
export function Logo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <ScribeMark size={size} />
      <span
        className="font-extrabold tracking-tight text-secondary"
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        Scribe<span className="text-primary"> IA</span>
      </span>
    </span>
  );
}
