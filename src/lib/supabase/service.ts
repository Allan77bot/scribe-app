"use server";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase service_role — réservé aux opérations admin (création de
 * profil auto-réparation). JAMAIS côté client, jamais dans un composant.
 *
 * Usage : uniquement dans des server components / server actions pour des
 * écritures légitimes qui contournent RLS (ex: créer le profil d'un nouvel
 * utilisateur après auth).
 */
export async function createClient(): Promise<SupabaseClient> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante dans l'environnement.");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
