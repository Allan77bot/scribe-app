import type { ReactNode } from "react";

// Conteneur typographique des documents légaux. Le projet n'a pas le plugin
// @tailwindcss/typography → on style les éléments enfants via variantes descendantes
// Tailwind v4. Les couleurs de titres (h2/h3) viennent de globals.css (secondary).
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="text-[15px] leading-relaxed text-on-surface [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-secondary">
      {children}
    </div>
  );
}
