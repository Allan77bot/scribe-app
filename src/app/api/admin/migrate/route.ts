import { NextResponse } from "next/server";

/**
 * POST /api/admin/migrate
 * Vérifie l'état des migrations sur Supabase.
 * Protégé par token partagé : {"token":"scribe-migrate-2026"}
 *
 * Pour appliquer les migrations : exécuter supabase/migrations/0012_fix_all.sql
 * dans l'éditeur SQL Supabase (Dashboard → SQL Editor).
 */
export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (token !== "scribe-migrate-2026") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: `env missing (url=${!!url}, key=${key?.length ?? 0} chars)` }, { status: 500 });
    }

    const status: Record<string, string> = {};

    // Check tables via REST API
    for (const table of ["task_validations", "invitations", "organizations", "users"]) {
      try {
        const res = await fetch(`${url}/rest/v1/${table}?limit=0`, {
          headers: { Authorization: `Bearer ${key}`, apikey: key },
        });
        status[table] = res.ok ? "✓" : `✗ ${res.status}`;
      } catch {
        status[table] = "✗ unreachable";
      }
    }

    // Check users columns
    try {
      const res = await fetch(`${url}/rest/v1/users?select=avatar_url,color&limit=1`, {
        headers: { Authorization: `Bearer ${key}`, apikey: key },
      });
      const data = await res.json();
      const row = Array.isArray(data) ? data[0] : data;
      status["users.avatar_url"] = row && "avatar_url" in Object(row) ? "✓" : "✗ missing";
      status["users.color"] = row && "color" in Object(row) ? "✓" : "✗ missing";
    } catch {
      status["users.cols"] = "✗ unreachable";
    }

    // Check avatars bucket
    try {
      const res = await fetch(`${url}/storage/v1/bucket/avatars`, {
        headers: { Authorization: `Bearer ${key}`, apikey: key },
      });
      status["bucket.avatars"] = res.ok ? "✓" : `✗ ${res.status}`;
    } catch {
      status["bucket.avatars"] = "✗ unreachable";
    }

    return NextResponse.json({ ok: true, status, action: "Run supabase/migrations/0012_fix_all.sql in SQL Editor if any ✗" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
