import Image from "next/image";

// Bandeau héro d'onboarding : illustration de bienvenue en tête de carte.
// DEUX images par écran (clair + sombre) → le bandeau s'adapte au thème (swap
// en CSS via html[data-theme="dark"], la convention de globals.css).
// L'illustration est affichée ENTIÈRE (object-contain, pas de recadrage/zoom) ;
// le fond du bandeau est assorti au fond cuit de l'illustration (crème en clair,
// marine en sombre) → le letterbox est invisible. Plein cadre dans la carte
// parente (rounded-card p-6) via les marges négatives -mx-6 -mt-6. Légère
// révélation au montage, neutralisée si l'utilisateur a réduit les animations.
export default function OnboardingHero({
  srcLight,
  srcDark,
  alt,
}: {
  srcLight: string;
  srcDark: string;
  alt: string;
}) {
  return (
    <div className="onb-hero relative -mx-6 -mt-6 mb-5 h-48 overflow-hidden rounded-t-card">
      <style>{`
        .onb-hero { background: #F8F7F4; }
        html[data-theme="dark"] .onb-hero { background: #12132A; }
        @keyframes scribeHeroIn { from { opacity:0; transform: scale(1.04); } to { opacity:1; transform:none; } }
        .scribe-hero { animation: scribeHeroIn .5s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .scribe-hero { animation: none; } }
        .onb-hero .onb-dark { display: none; }
        html[data-theme="dark"] .onb-hero .onb-light { display: none; }
        html[data-theme="dark"] .onb-hero .onb-dark { display: block; }
      `}</style>
      <Image
        src={srcLight}
        alt={alt}
        fill
        priority
        sizes="(max-width: 480px) 100vw, 448px"
        className="scribe-hero onb-light object-contain"
      />
      <Image
        src={srcDark}
        alt=""
        aria-hidden
        fill
        priority
        sizes="(max-width: 480px) 100vw, 448px"
        className="scribe-hero onb-dark object-contain"
      />
    </div>
  );
}
