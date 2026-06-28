import type { Metadata } from "next";
import { Prose } from "@/components/legal/Prose";
import { LastUpdated } from "@/components/legal/LastUpdated";

export const metadata: Metadata = {
  title: "Mentions légales — Scribe IA",
  description: "Mentions légales du service Scribe IA.",
};

export default function MentionsLegalesPage() {
  return (
    <Prose>
      <h1 className="text-2xl font-semibold text-secondary">Mentions légales</h1>
      <LastUpdated date="28 juin 2026" version="1.0" />

      <h2>Éditeur du service</h2>
      <p>
        Le service <strong>Scribe IA</strong> est édité par <strong>Allan Morjon</strong>,
        entrepreneur individuel (micro-entreprise).
      </p>
      <ul>
        <li>SIREN : <strong>878 736 784</strong></li>
        <li>Siège : 12 rue de la Pierre Lorraine, 77440 Congis-sur-Thérouanne, France</li>
        <li>Contact : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a></li>
        <li>TVA non applicable, article 293 B du Code général des impôts</li>
        <li>Directeur de la publication : Allan Morjon</li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        L&apos;application est hébergée par <strong>Vercel Inc.</strong> (440 N Barranca Ave
        #4133, Covina, CA 91723, États-Unis — région d&apos;exécution Union européenne).
        Les données (base de données, fichiers, authentification) sont hébergées par
        <strong> Supabase</strong> dans l&apos;Union européenne (Francfort, Allemagne).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du service (marque, logo, interface, textes) est protégé.
        Toute reproduction sans autorisation est interdite.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question : <a href="mailto:contact@scribeia.fr">contact@scribeia.fr</a>.
      </p>
    </Prose>
  );
}
