import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Conformité & RGPD — Scribe IA",
  description:
    "Hébergement en Europe, IA encadrée, validation humaine, vos droits : la conformité de Scribe IA.",
};

export default function ConformitePage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Conformité &amp; RGPD</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <p>
        Scribe IA est conçu pour un usage en équipe, dans le respect du RGPD et du droit du travail
        français. Voici nos engagements, en clair.
      </p>

      <h2>Hébergement et IA en Europe</h2>
      <p>
        Vos données sont hébergées dans l&apos;<strong>Union européenne</strong> (Francfort). La
        transcription et l&apos;analyse par IA passent par des entités <strong>européennes</strong>
        (OpenAI Ireland, Anthropic Ireland), <strong>sans entraînement</strong> sur vos contenus.
      </p>

      <h2>L'IA propose, l'humain valide</h2>
      <p>
        Aucune relance ni escalade n&apos;est déclenchée sans validation humaine. Scribe IA n&apos;est
        pas un outil de surveillance individuelle : il coordonne le travail d&apos;équipe, il ne note
        pas les personnes.
      </p>

      <h2>Vos droits, simplement</h2>
      <p>
        Accès, rectification, effacement, opposition, portabilité : écrivez à
        <a href="mailto:contact@scribeia.fr"> contact@scribeia.fr</a>. Détails dans notre{" "}
        <a href="/confidentialite">document dédié</a>.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li>Supabase — base de données et stockage (UE, Francfort)</li>
        <li>Vercel — hébergement de l&apos;application (UE)</li>
        <li>OpenAI Ireland Ltd — transcription (UE)</li>
        <li>Anthropic Ireland Ltd — extraction et synthèse (UE)</li>
        <li>Brevo — e-mails transactionnels (France)</li>
        <li>Stripe Payments Europe — paiement (UE)</li>
      </ul>

      <h2>Documents</h2>
      <ul>
        <li><a href="/mentions-legales">Mentions légales</a></li>
        <li><a href="/confidentialite">Politique de confidentialité</a></li>
        <li><a href="/cgu">Conditions générales d'utilisation</a></li>
        <li><a href="/conformite/dpa">Accord de sous-traitance (DPA) — imprimable</a></li>
      </ul>

      <h2 id="information-salaries">Notice d'information des salariés (modèle)</h2>
      <p>
        Avant de déployer Scribe IA, l&apos;employeur informe ses salariés (art. L.1222-4 du Code du
        travail) et, le cas échéant, consulte le CSE (art. L.2312-38, à partir de 50 salariés).
        Modèle à copier et adapter : {/* [À VALIDER PAR JURISTE] */}
      </p>
      <div className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">
        <p>
          « Notre entreprise utilise <strong>Scribe IA</strong> pour faciliter la coordination et la
          passation entre équipes. L&apos;outil traite des notes professionnelles (vocales ou écrites),
          des tâches et des accusés de lecture, dans le seul but d&apos;organiser le travail.
          Il ne s&apos;agit pas d&apos;un dispositif de surveillance individuelle ni d&apos;évaluation.
          Les données sont hébergées dans l&apos;Union européenne. Vous disposez de droits d&apos;accès,
          de rectification et d&apos;opposition, à exercer auprès de [responsable interne / DPO].
          [Le CSE a été informé/consulté le … le cas échéant.] »
        </p>
      </div>

      <p className="text-sm text-on-surface-variant">
        Kit complet (clause de règlement intérieur + checklist de consultation du CSE) disponible sur
        demande à <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.
      </p>
    </Prose>
  );
}
