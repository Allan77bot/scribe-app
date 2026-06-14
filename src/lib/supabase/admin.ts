import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client Supabase à privilèges service_role — bypass la RLS. À n'utiliser QUE
// côté serveur, jamais exposé au client. Sert ici à générer les liens d'action
// (confirmation, reset) qu'on délivre ensuite nous-mêmes via Brevo, plutôt que
// de laisser Supabase envoyer ses propres e-mails.
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes — client admin indisponible.",
    );
  }

  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
