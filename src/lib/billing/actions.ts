"use server";

import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY non configurée");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}

export async function createCheckoutSession(plan: string): Promise<{url?: string, error?: string}> {
  const supabase = await createClient();

  // Vérifie que l'utilisateur est connecté
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  // Récupère l'organisation de l'utilisateur et vérifie qu'il est admin
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, organizations(*)")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Profil utilisateur introuvable" };
  }

  if (profile.role !== "admin") {
    return { error: "Seuls les administrateurs peuvent modifier la facturation" };
  }

  // La jointure renvoie l'org liée à l'utilisateur ; on ne lit que ces champs.
  type OrgRef = { id: string; stripe_customer_id: string | null };
  const org = profile.organizations as unknown as OrgRef | null;
  if (!org) {
    return { error: "Organisation introuvable" };
  }

  // Validation du plan
  if (!["solo", "team", "business"].includes(plan)) {
    return { error: "Plan invalide" };
  }

  // Map des plans vers les IDs de prix Stripe
  const priceMap = {
    solo: process.env.STRIPE_PRICE_SOLO,
    team: process.env.STRIPE_PRICE_TEAM,
    business: process.env.STRIPE_PRICE_BUSINESS,
  };

  const priceId = priceMap[plan as keyof typeof priceMap];
  if (!priceId) {
    return { error: `Prix Stripe non configuré pour le plan ${plan}` };
  }

  try {
    let customerId = org.stripe_customer_id;

    // Crée un client Stripe si nécessaire
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email!,
        metadata: {
          org_id: org.id,
        },
      });
      customerId = customer.id;

      // Met à jour l'organisation avec le customer ID
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", org.id);
    }

    // Crée la session de checkout
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`,
      metadata: {
        org_id: org.id,
      },
    });

    if (!session.url) {
      return { error: "Impossible de créer la session de paiement" };
    }

    return { url: session.url };
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    return { error: "Erreur lors de la création de la session de paiement" };
  }
}