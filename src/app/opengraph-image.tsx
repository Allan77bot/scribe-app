import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

// Carte Open Graph générée à la volée (moteur Satori). C'est l'aperçu riche
// affiché quand on partage un lien Scribe (LinkedIn, SMS, cold email, accueil).
// Police + logo chargés depuis le filesystem via import.meta.url : `new URL`
// déclenche le traçage d'assets de Turbopack (l'asset est donc bien embarqué en
// prod) et `readFile` lit le fichier (le `fetch` d'une URL file:// n'est pas
// supporté par Node sous Turbopack). On charge deux graisses STATIQUES de Manrope
// (Satori ne gère pas les polices variables : il plante sur Manrope[wght].ttf).
// Fond en HEX fixes (indépendant du thème app).
export const runtime = "nodejs";
export const alt =
  "Scribe — l'IA transforme vos notes en tâches suivies pour l'équipe.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [manropeSemiBold, manropeExtraBold, logo] = await Promise.all([
    readFile(new URL("./_og/Manrope-SemiBold.woff", import.meta.url)),
    readFile(new URL("./_og/Manrope-ExtraBold.woff", import.meta.url)),
    readFile(new URL("./_og/logo.png", import.meta.url)),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Manrope",
          background:
            "linear-gradient(135deg, #2A4FB0 0%, #1B2A66 55%, #12132A 100%)",
          position: "relative",
        }}
      >
        {/* Accent cyan, signature de marque */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(34,211,238,0.18)",
            display: "flex",
          }}
        />
        {/* En-tête : mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={104} height={104} alt="" />
          <div
            style={{ fontSize: 56, fontWeight: 800, color: "#FFFFFF" }}
          >
            Scribe
          </div>
        </div>
        {/* Bloc message */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            L&apos;IA transforme vos notes en tâches suivies pour l&apos;équipe.
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "#22D3EE",
              marginTop: 28,
            }}
          >
            Dictez, l&apos;IA extrait et suit — rien ne se perd.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: manropeSemiBold, weight: 600, style: "normal" },
        { name: "Manrope", data: manropeExtraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
