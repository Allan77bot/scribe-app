"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";

// Cercle de 64px cliquable : ouvre le sélecteur de fichier, prévisualise tout
// de suite, puis envoie à /api/user/avatar/upload. Pendant l'envoi, un voile +
// spinner couvre la photo. Le parent (Réglages) fournit l'état courant.

type Props = {
  name: string;
  email: string;
  color?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
};

export default function AvatarUpload({
  name,
  email,
  color,
  avatarUrl,
  isAdmin,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Aperçu local immédiat via data: URL (sûr avec next/image, contrairement
    // aux blob:). Léger pour un avatar (≤ 5 Mo).
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
    setPreview(dataUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/avatar/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "L'envoi a échoué. Réessayez.");
        setPreview(null);
        return;
      }
      // La photo est en base : on rafraîchit pour la propager (menu, équipe…).
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative rounded-full transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Changer la photo de profil"
      >
        <Avatar
          name={name}
          email={email}
          color={color}
          avatarUrl={preview ?? avatarUrl}
          isAdmin={isAdmin}
          size={64}
        />

        {/* Pastille appareil photo — repère d'action en bas à droite. */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-card">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4z" />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
        </span>

        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-secondary/40">
            <span
              className="h-6 w-6 animate-spin rounded-full border-2 border-white"
              style={{ borderTopColor: "transparent" }}
            />
          </span>
        )}
      </button>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-on-surface">Photo de profil</p>
        <p className="text-xs text-on-surface-variant">
          JPG, PNG ou WebP — 5 Mo max.
        </p>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
