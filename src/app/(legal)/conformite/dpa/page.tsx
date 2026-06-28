import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";
import { PrintButton } from "@/components/legal/PrintButton";

export const metadata: Metadata = {
  title: "Accord de sous-traitance (DPA) — Scribe IA",
  description: "Accord de sous-traitance des données (art. 28 RGPD) — Scribe IA.",
};

export default function DpaPage() {
  return (
    <Prose>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <span className="eyebrow">Document contractuel</span>
        <PrintButton />
      </div>
      <h1 className="text-2xl font-semibold text-secondary">Accord de sous-traitance (DPA)</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <p>
        Le présent accord (art. 28 RGPD) encadre le traitement des données personnelles réalisé par
        <strong> Scribe IA</strong> (Allan Morjon, sous-traitant) pour le compte du
        <strong> client</strong> (responsable de traitement). {/* [À VALIDER PAR JURISTE] */}
      </p>

      <h2>1. Parties</h2>
      <ul>
        <li><strong>Responsable de traitement</strong> : le client — [Raison sociale, SIREN, adresse à compléter par le client].</li>
        <li><strong>Sous-traitant</strong> : Allan Morjon (Scribe IA), SIREN 878 736 784, 12 rue de la Pierre Lorraine, 77440 Congis-sur-Thérouanne.</li>
      </ul>

      <h2>2. Objet, durée, nature et finalité</h2>
      <p>
        Traitement des notes professionnelles, tâches et accusés de lecture aux fins de coordination
        d&apos;équipe et de passation, pour la durée du contrat de service.
      </p>

      <h2>3. Catégories de données et de personnes</h2>
      <p>
        Données d&apos;identification et de contenu professionnel des membres de l&apos;équipe du
        responsable de traitement (salariés, collaborateurs).
      </p>

      <h2>4. Obligations du sous-traitant</h2>
      <ul>
        <li>Traiter les données uniquement sur instructions documentées du responsable.</li>
        <li>Garantir la confidentialité des personnes autorisées à traiter les données.</li>
        <li>Mettre en œuvre les mesures de sécurité de l&apos;article 32 (voir Annexe 2).</li>
        <li>Recourir à des sous-traitants ultérieurs avec information préalable et droit d&apos;objection (Annexe 1).</li>
        <li>Assister le responsable pour les demandes d&apos;exercice de droits et les analyses d&apos;impact.</li>
        <li>Notifier toute violation de données dans les meilleurs délais.</li>
        <li>Supprimer ou restituer les données en fin de contrat.</li>
        <li>Permettre des audits raisonnables.</li>
      </ul>

      <h2>Annexe 1 — Sous-traitants ultérieurs</h2>
      <ul>
        <li>Supabase — base de données et stockage (UE)</li>
        <li>Vercel — hébergement (UE ; CCT)</li>
        <li>OpenAI Ireland Ltd — transcription (UE)</li>
        <li>Anthropic Ireland Ltd — extraction et synthèse (UE)</li>
        <li>Brevo — e-mails (France)</li>
        <li>Stripe Payments Europe — paiement (UE)</li>
      </ul>

      <h2>Annexe 2 — Mesures techniques et organisationnelles</h2>
      <ul>
        <li>Cloisonnement par organisation (Row Level Security).</li>
        <li>Accès aux fichiers par URL signées, stockage chiffré, transit chiffré (TLS).</li>
        <li>Authentification par sessions, mots de passe chiffrés.</li>
        <li>Hébergement en Union européenne.</li>
      </ul>

      <h2>Signatures</h2>
      <p>Pour le responsable de traitement : ______________________ (nom, date, signature)</p>
      <p>Pour le sous-traitant : Allan Morjon — Scribe IA ______________________ (date, signature)</p>
    </Prose>
  );
}
