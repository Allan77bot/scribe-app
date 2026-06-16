import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/migrate
 * Applique les migrations 0006+0007 sur Supabase.
 * Protégé par token partagé dans le body.
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
      return NextResponse.json({ error: "env missing" }, { status: 500 });
    }

    const admin = createClient(url, key, { auth: { persistSession: false } });

    const results: string[] = [];

    // === Migration 0006: task_validations + onboarding ===

    // Créer la table task_validations si elle n'existe pas
    const { error: tvE } = await admin.rpc("pgrest_exec", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.task_validations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
          task_id uuid NOT NULL,
          validated_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          status text NOT NULL DEFAULT 'pending',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        )
      `,
    });
    results.push("m6_table: " + (tvE ? "✗ " + tvE.message : "✓"));

    // RLS pour task_validations
    const { error: rls6 } = await admin.rpc("pgrest_exec", {
      sql: `
        ALTER TABLE IF EXISTS public.task_validations ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS tv_select ON public.task_validations FOR SELECT TO authenticated USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS tv_insert ON public.task_validations FOR INSERT TO authenticated WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS tv_update ON public.task_validations FOR UPDATE TO authenticated USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS tv_service ON public.task_validations FOR INSERT TO service_role WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `,
    });
    results.push("m6_rls: " + (rls6 ? "✗ " + rls6.message : "✓"));

    // Colonne onboarding_complete
    const { error: onboardE } = await admin.rpc("pgrest_exec", {
      sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false`,
    });
    results.push("m6_onboarding: " + (onboardE ? "✗ " + onboardE.message : "✓"));

    // === Migration 0007: invitations ===

    const { error: inv7 } = await admin.rpc("pgrest_exec", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.invitations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
          email text NOT NULL,
          token uuid NOT NULL DEFAULT gen_random_uuid(),
          created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
          accepted_at timestamptz,
          status text NOT NULL DEFAULT 'pending',
          created_at timestamptz DEFAULT now()
        )
      `,
    });
    results.push("m7_table: " + (inv7 ? "✗ " + inv7.message : "✓"));

    const { error: rls7 } = await admin.rpc("pgrest_exec", {
      sql: `
        CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_key ON public.invitations(token);
        ALTER TABLE IF EXISTS public.invitations ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS inv_select ON public.invitations FOR SELECT TO authenticated USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS inv_insert ON public.invitations FOR INSERT TO authenticated WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS inv_update ON public.invitations FOR UPDATE TO authenticated USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY IF NOT EXISTS inv_service ON public.invitations FOR INSERT TO service_role WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `,
    });
    results.push("m7_rls: " + (rls7 ? "✗ " + rls7.message : "✓"));

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
