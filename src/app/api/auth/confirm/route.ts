import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/email/send";

// POST /api/auth/confirm — renvoie l'e-mail de confirmation à une adresse.
// Utilisé depuis l'écran de connexion (« je n'ai pas reçu l'e-mail »).
//
// Anti-énumération : on répond TOUJOURS 200 avec le même message, qu'un compte
// existe ou non. On ne révèle jamais si l'adresse est connue. Le détail est
// loggé côté serveur uniquement.
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const ok = { message: "Si un compte existe, l'e-mail de confirmation a été renvoyé." };

  try {
    const admin = createAdminClient();
    // Renvoi sans mot de passe : on génère un lien « magiclink ». Pour un compte
    // non confirmé, sa consommation confirme l'adresse et ouvre la session — ce
    // qu'on attend d'un « je n'ai pas reçu mon e-mail de confirmation ».
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login?message=email-confirmed`,
      },
    });

    // Pas de lien (compte inexistant, déjà confirmé, ou erreur) → réponse
    // identique, pas de fuite d'information.
    if (error || !data.properties?.action_link) {
      console.error("[api:auth/confirm] generateLink", error?.message);
      return NextResponse.json(ok);
    }

    await sendVerificationEmail(email, data.properties.action_link);
    return NextResponse.json(ok);
  } catch (err) {
    console.error(
      "[api:auth/confirm]",
      err instanceof Error ? err.message : String(err),
    );
    // Même en cas d'échec interne, on ne distingue pas le cas « compte inconnu ».
    return NextResponse.json(ok);
  }
}
