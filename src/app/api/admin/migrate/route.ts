import { NextResponse } from "next/server";
import { createClient as createSessionClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/migrate
 * Diagnostic de l'état du schéma en prod (LECTURE SEULE).
 *
 * AUTH (règle d'or n°1) : session Supabase + rôle 'admin'. PLUS de token statique.
 * L'ancien token en clair `scribe-migrate-2026` gardait un endpoint à privilèges
 * service_role — supprimé.
 *
 * Pour APPLIQUER les migrations : exécuter supabase/migrations/0013_reconcile_drift.sql
 * dans l'éditeur SQL Supabase (Dashboard → SQL Editor), APRÈS un snapshot de la base.
 */
export async function POST() {
  try {
    // ── Garde de session : authentifié ET admin de son org (règle d'or n°1/n°2). ──
    const supabase = await createSessionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { error: `env missing (url=${!!url}, key=${key?.length ?? 0} chars)` },
        { status: 500 },
      );
    }

    const status: Record<string, string> = {};
    const headers = { Authorization: `Bearer ${key}`, apikey: key };

    // Existence des tables.
    for (const table of [
      "task_validations",
      "invitations",
      "organizations",
      "users",
      "reports",
    ]) {
      try {
        const res = await fetch(`${url}/rest/v1/${table}?limit=0`, { headers });
        status[table] = res.ok ? "✓" : `✗ ${res.status}`;
      } catch {
        status[table] = "✗ unreachable";
      }
    }

    // Vérification post-migration 0013 : colonnes clés du drift (un select sur une
    // colonne absente échoue → on détecte le drift à distance).
    async function probe(query: string, label: string) {
      try {
        const res = await fetch(`${url}/rest/v1/${query}`, { headers });
        status[label] = res.ok ? "✓" : "✗ missing";
      } catch {
        status[label] = "✗ unreachable";
      }
    }
    await probe(
      "task_validations?select=entry_id,task_index&limit=0",
      "task_validations.entry_id+task_index",
    );
    await probe("reports?select=kind&limit=0", "reports.kind");
    await probe("users?select=avatar_url,color&limit=1", "users.avatar_url+color");

    // Bucket avatars.
    try {
      const res = await fetch(`${url}/storage/v1/bucket/avatars`, { headers });
      status["bucket.avatars"] = res.ok ? "✓" : `✗ ${res.status}`;
    } catch {
      status["bucket.avatars"] = "✗ unreachable";
    }

    return NextResponse.json({
      ok: true,
      status,
      action:
        "Si un ✗ : exécuter supabase/migrations/0013_reconcile_drift.sql dans le SQL Editor (après snapshot).",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
