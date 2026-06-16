// Identité visuelle des membres — palette, initiales, contraste.
// Partagé par AvatarUpload, UserMenu, la page Équipe et les Réglages.
// Les couleurs sont des données utilisateur (choisies par membre) : elles
// vivent donc en `style={{ backgroundColor }}` côté composant, pas en token
// Tailwind (impossible de générer une classe depuis une valeur runtime).

// Palette AA — 8 teintes distinctes, contraste suffisant pour une initiale.
// L'ordre fait foi : l'auto-attribution (trigger SQL) pioche la 1re libre.
export const MEMBER_COLORS = [
  "#E74C3C", // rouge
  "#3498DB", // bleu
  "#2ECC71", // vert
  "#F39C12", // orange doux
  "#9B59B6", // violet
  "#1ABC9C", // turquoise
  "#E67E22", // orange
  "#ECF0F1", // gris clair
] as const;

export type MemberColor = (typeof MEMBER_COLORS)[number];

// Bordure or réservée aux admins (FEATURE 2). Hors palette de membre.
export const ADMIN_RING = "#D4AF37";

// Couleur de repli quand un membre n'a pas encore de couleur (legacy/migration).
export const FALLBACK_COLOR = "#3498DB";

// Initiales pour le monogramme — 2 lettres max, dérivées du nom puis de l'e-mail.
export function initials(name: string | null | undefined, email: string): string {
  const base = (name ?? "").trim() || email.split("@")[0];
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return letters.toUpperCase();
}

// Texte lisible sur une couleur de fond : blanc sur teinte foncée, navy sur
// teinte claire (ex. #ECF0F1). Luminance perçue (sRGB simplifiée).
export function textColorOn(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#181c1e" : "#ffffff";
}

// Garde-fou serveur : une couleur valide est exactement une teinte de la palette.
export function isValidMemberColor(value: string): value is MemberColor {
  return (MEMBER_COLORS as readonly string[]).includes(value);
}
