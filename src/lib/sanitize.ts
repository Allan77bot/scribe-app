// Sanitizer HTML par liste blanche pour le HTML généré par le LLM (rapports + passation).
// Le prompt contraint déjà le modèle à un jeu de balises sûr, mais on ne FAIT JAMAIS
// confiance à une sortie LLM : on retire scripts, styles, et TOUTES les balises/attributs
// hors liste blanche avant d'injecter via dangerouslySetInnerHTML (corrige le risque XSS
// relevé par l'audit). Sans dépendance (pas de DOMPurify côté serveur).

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "hr",
  "br",
]);

// Échappe les caractères HTML dangereux pour interpoler une valeur utilisateur dans du
// HTML (e-mails transactionnels notamment — faille AS-06). NE PAS utiliser pour le HTML
// produit par le LLM : pour ça, voir sanitizeReportHtml (liste blanche de balises).
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Nettoie une valeur « une ligne » saisie par l'utilisateur (display_name, org_name) :
// remplace les caractères de contrôle C0 (0–31) et DEL (127) — dont les retours-ligne,
// ce qui neutralise l'injection d'en-têtes/CRLF —, compacte les espaces et tronque à
// `max` (faille AS-13). Parcours par code-point pour éviter tout regex sur des
// caractères de contrôle.
export function cleanLine(value: string, max: number): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 32 || code === 127 ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, max);
}

export function sanitizeReportHtml(html: string): string {
  if (!html) return "";
  return (
    html
      // 1. Retire commentaires (peuvent masquer des charges utiles).
      .replace(/<!--[\s\S]*?-->/g, "")
      // 2. Retire entièrement les blocs script/style (contenu compris).
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
      // 3. Toute balise : conservée SANS attribut si autorisée, sinon supprimée.
      //    Strip des attributs → neutralise onerror=, href=javascript:, style=, etc.
      .replace(/<\/?([a-zA-Z0-9]+)\b[^>]*>/g, (match, tag) => {
        const name = String(tag).toLowerCase();
        if (!ALLOWED_TAGS.has(name)) return "";
        const closing = match.startsWith("</") ? "/" : "";
        return `<${closing}${name}>`;
      })
  );
}
