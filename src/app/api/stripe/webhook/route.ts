import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Mappe un statut d'abonnement Stripe vers les valeurs autorisées par le
// check constraint de organizations.subscription_status
// (trial | active | past_due | canceled | unpaid). Sans ça, un statut Stripe
// comme « trialing » ou « incomplete » ferait échouer l'update → Stripe
// réessaierait le webhook en boucle.
function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
    case "paused":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "unpaid";
    default:
      return "unpaid";
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`⚠️ Webhook signature verification failed.`, message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Utilise le client admin pour modifier les données org (service_role)
  const supabase = createAdminSupabase(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;

        if (!orgId || !session.customer || !session.subscription) {
          console.error("Missing required fields in checkout session:", { orgId, customer: session.customer, subscription: session.subscription });
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Détermine le plan selon le produit Stripe.
        // line_items n'est PAS inclus dans le payload de l'événement : on le
        // récupère explicitement via l'API (sinon le prix serait introuvable).
        let plan = "solo"; // défaut
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 1,
        });
        const priceId = lineItems.data[0]?.price?.id;
        if (priceId === process.env.STRIPE_PRICE_TEAM) plan = "team";
        else if (priceId === process.env.STRIPE_PRICE_BUSINESS) plan = "business";

        // Met à jour l'organisation avec les infos Stripe
        const { error } = await supabase
          .from("organizations")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
            plan: plan,
          })
          .eq("id", orgId);

        if (error) {
          console.error("Error updating organization:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        console.log(`✅ Checkout completed for org ${orgId}, plan ${plan}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Met à jour le statut de l'abonnement (mappé vers nos valeurs autorisées)
        const { error } = await supabase
          .from("organizations")
          .update({
            subscription_status: mapStripeStatus(subscription.status),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription status:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        console.log(`✅ Subscription ${subscription.id} updated to ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Marque l'abonnement comme annulé
        const { error } = await supabase
          .from("organizations")
          .update({
            subscription_status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription status:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        console.log(`✅ Subscription ${subscription.id} canceled`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}