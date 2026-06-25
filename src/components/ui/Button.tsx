import type { ButtonHTMLAttributes, ReactNode } from "react";

// Button — contrôle principal du DS « Scribe IA » (buttons).
// Pilule (chaleur, anti-corporate). Cobalt primary, azure secondary, text discret,
// danger pour les actions destructives. Hauteur ≥ 44px (cible tactile terrain,
// gants) — 56px pour les actions principales. Corrige le 36px flaggé à l'audit.

type Variant = "primary" | "secondary" | "text" | "danger";
type Size = "lg" | "md";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-card hover:bg-primary-container active:scale-[0.98]",
  secondary:
    "bg-azure text-primary hover:brightness-95 active:scale-[0.98]",
  text: "bg-transparent text-primary hover:bg-azure active:scale-[0.98]",
  danger: "bg-transparent text-error hover:bg-error-container active:scale-[0.98]",
};

const SIZE: Record<Size, string> = {
  lg: "min-h-14 px-7 text-base", // 56px — action principale
  md: "min-h-11 px-5 text-sm", // 44px — cible tactile minimale
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconLeft,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all disabled:pointer-events-none disabled:opacity-40 ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      {...rest}
    >
      {iconLeft}
      {children}
    </button>
  );
}
