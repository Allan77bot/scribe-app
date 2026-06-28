import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Scribe IA",
  description: "Comment Scribe IA traite les données personnelles (RGPD).",
};

export default function ConfidentialitePage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Politique de confidentialité</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <p>
        La présente politique décrit comment <strong>Scribe IA</strong> (Allan Morjon,
        micro-entreprise) traite les données personnelles, conformément au RGPD.
      </p>

      <h2>1. Deux rôles distincts</h2>
      <p>
        <strong>Données des membres de votre équipe.</strong> Lorsque vous utilisez Scribe IA,
        votre organisation est <strong>responsable de traitement</strong> et Scribe IA agit comme
        <strong> sous-traitant</strong>, pour votre compte et sur vos instructions. Ce cadre est
        défini par notre <a href="/conformite/dpa">accord de sous-traitance (DPA)</a>.
      </p>
      <p>
        <strong>Données des visiteurs et prospects.</strong> Pour les personnes qui nous
        contactent ou visitent notre site, <strong>Scribe IA est responsable de traitement</strong>.
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>Compte : nom, adresse e-mail, mot de passe (chiffré), organisation, rôle.</li>
        <li>Contenu : notes vocales et écrites, tâches, accusés de lecture, rapports.</li>
        <li>Techniques : journaux de connexion, données d&apos;usage strictement nécessaires.</li>
        <li>Prospects : adresse e-mail et message lorsque vous nous écrivez.</li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>Fournir le service (comptes, capture, coordination) — <strong>exécution du contrat</strong>.</li>
        <li>Traitement du contenu par l&apos;IA (transcription, extraction) — pour le compte du responsable de traitement. {/* [À VALIDER PAR JURISTE] */}</li>
        <li>Facturation — <strong>obligation légale</strong>.</li>
        <li>Sécurité et prévention des abus — <strong>intérêt légitime</strong>.</li>
        <li>Réponse aux prospects — <strong>intérêt légitime</strong> (prospection B2B).</li>
      </ul>

      <h2>4. Sous-traitants</h2>
      <p>Nous faisons appel aux sous-traitants suivants, tous situés dans l&apos;Union européenne :</p>
      <ul>
        <li><strong>Supabase</strong> — base de données, stockage, authentification (UE, Francfort).</li>
        <li><strong>Vercel</strong> — hébergement de l&apos;application (UE ; éditeur américain, encadré par des clauses contractuelles types).</li>
        <li><strong>OpenAI Ireland Ltd</strong> — transcription des notes vocales (UE ; rétention 30 jours, pas d&apos;entraînement sur les données de l&apos;API).</li>
        <li><strong>Anthropic Ireland Ltd</strong> — extraction et synthèse par IA (UE ; pas d&apos;entraînement sur les données de l&apos;API).</li>
        <li><strong>Brevo</strong> — e-mails transactionnels (France).</li>
        <li><strong>Stripe Payments Europe</strong> — paiement des abonnements (UE, Irlande).</li>
      </ul>

      <h2>5. Transferts hors UE</h2>
      <p>
        Les données sont hébergées dans l&apos;Union européenne. Lorsqu&apos;un sous-traitant a une
        maison-mère hors UE, le transfert est encadré par des <strong>clauses contractuelles types</strong>
        (CCT) de la Commission européenne. {/* [À VALIDER PAR JURISTE] */}
      </p>

      <h2>6. Durées de conservation</h2>
      <ul>
        <li>Compte et données d&apos;organisation : durée du contrat, puis suppression sous 30 jours. {/* [À VALIDER PAR JURISTE] */}</li>
        <li>Fichiers audio : le temps nécessaire à la fonctionnalité, supprimés avec l&apos;entrée ou l&apos;organisation. {/* [À VALIDER PAR JURISTE] */}</li>
        <li>Données de facturation : 10 ans (obligation comptable).</li>
        <li>Données de prospection : 3 ans après le dernier contact.</li>
        <li>Journaux techniques : 6 à 12 mois.</li>
      </ul>

      <h2>7. Sécurité</h2>
      <p>
        Cloisonnement strict par organisation (Row Level Security), accès aux fichiers par URL
        signées, chiffrement en transit. Aucune organisation n&apos;accède aux données d&apos;une autre.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Scribe IA utilise uniquement des cookies <strong>strictement nécessaires</strong> (session de
        connexion) et, le cas échéant, une <strong>mesure d&apos;audience anonyme</strong> exemptée de
        consentement. <strong>Aucun cookie publicitaire</strong>, aucun traceur tiers de suivi.
      </p>

      <h2>9. Vos droits</h2>
      <p>
        Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation,
        d&apos;opposition et de portabilité, ainsi que du droit d&apos;introduire une réclamation
        auprès de la <strong>CNIL</strong>. Pour les données d&apos;un salarié, ces droits s&apos;exercent
        auprès de l&apos;employeur (responsable de traitement) ; Scribe IA l&apos;assiste.
      </p>
      <p>Contact : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.</p>
    </Prose>
  );
}
