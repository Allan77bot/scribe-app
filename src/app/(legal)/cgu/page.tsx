import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Scribe IA",
  description: "Conditions générales d'utilisation du service Scribe IA.",
};

export default function CguPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Conditions générales d'utilisation</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent l&apos;utilisation du service <strong>Scribe IA</strong>,
        qui transforme des notes vocales et écrites en coordination d&apos;équipe (tâches suivies,
        accusés de lecture, rapport de passation).
      </p>

      <h2>2. Compte et accès</h2>
      <p>
        L&apos;accès nécessite la création d&apos;un compte. Vous êtes responsable de la
        confidentialité de vos identifiants et des actions réalisées via votre compte.
      </p>

      <h2>3. Usage acceptable</h2>
      <p>
        Vous vous engagez à un usage professionnel, licite, sans porter atteinte aux droits des tiers
        ni détourner le service de sa finalité de coordination.
      </p>

      <h2>4. Fonctionnement de l&apos;intelligence artificielle</h2>
      <p>
        Scribe IA recourt à l&apos;IA pour <strong>transcrire</strong> les notes vocales (OpenAI
        Ireland Ltd) et <strong>extraire et synthétiser</strong> les tâches (Anthropic Ireland Ltd).
      </p>
      <ul>
        <li><strong>L&apos;IA propose, l&apos;humain valide.</strong> Aucune tâche ne déclenche d&apos;effet (relance, escalade) sans validation humaine explicite : il n&apos;y a pas de décision entièrement automatisée produisant des effets juridiques (art. 22 RGPD).</li>
        <li>La transcription et l&apos;extraction peuvent comporter des erreurs ; il vous appartient de vérifier et de valider le contenu proposé.</li>
        <li>Vos contenus ne sont <strong>pas utilisés pour entraîner</strong> les modèles d&apos;IA (usage via API).</li>
      </ul>

      <h2>5. Abonnement et paiement</h2>
      <p>
        Certaines fonctionnalités sont payantes, par abonnement, réglé via <strong>Stripe</strong>.
        Les conditions tarifaires sont présentées avant souscription. {/* [À VALIDER PAR JURISTE] — tient lieu de CGV en attendant des CGV dédiées */}
      </p>

      <h2>6. Responsabilités</h2>
      <p>
        Le service est fourni « en l&apos;état ». Scribe IA met en œuvre des moyens raisonnables de
        disponibilité et de sécurité, sans garantie d&apos;absence totale d&apos;interruption ou
        d&apos;erreur. {/* [À VALIDER PAR JURISTE] */}
      </p>

      <h2>7. Résiliation</h2>
      <p>Vous pouvez cesser d&apos;utiliser le service à tout moment. Les modalités de suppression des données figurent dans la <a href="/confidentialite">politique de confidentialité</a>.</p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes conditions sont régies par le droit français. {/* [À VALIDER PAR JURISTE] */}</p>

      <p>Contact : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.</p>
    </Prose>
  );
}
