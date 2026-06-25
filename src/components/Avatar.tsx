import Image from "next/image";
import { ADMIN_RING, FALLBACK_COLOR, initials, textColorOn } from "@/lib/avatar";

// Avatar circulaire — photo si disponible, sinon monogramme sur la couleur du
// membre. Élément humanisant face aux données (DESIGN.md §5). Présentationnel
// (utilisable côté serveur). La couleur étant une donnée membre, on l'applique
// en style inline (impossible à tokeniser en Tailwind).

type Props = {
  name: string | null | undefined;
  email: string;
  color?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  size?: number; // diamètre en px (défaut 40)
};

export default function Avatar({
  name,
  email,
  color,
  avatarUrl,
  isAdmin = false,
  size = 40,
}: Props) {
  const bg = color || FALLBACK_COLOR;
  // Bordure or 2px pour les admins, sinon liseré blanc discret (détache la photo
  // du fond sans bordure forte — DESIGN.md §6).
  const ring = isAdmin
    ? `0 0 0 2px ${ADMIN_RING}`
    : "0 0 0 1px rgba(255,255,255,0.6)";

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarUrl ? "transparent" : bg,
        boxShadow: ring,
      }}
      aria-hidden
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span
          className="font-bold leading-none"
          style={{ color: textColorOn(bg), fontSize: Math.round(size * 0.38) }}
        >
          {initials(name, email)}
        </span>
      )}
    </span>
  );
}
