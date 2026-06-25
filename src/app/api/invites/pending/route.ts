import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { acceptUrl } from "@/lib/invitations/service";

// ── GET /api/invites/pending ────────────────────────────────────────────────
// Liste les invitations en attente (non expirées) de l'org courante. Réservé aux
// admins. La RLS cloisonne déjà par org_id ; on filtre en plus status/expiration.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Réservé aux administrateurs de l'équipe." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, token, expires_at, created_at")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[invites:pending]", error.message);
    return NextResponse.json(
      { error: "Lecture des invitations impossible." },
      { status: 500 },
    );
  }

  const invites = (data ?? []).map((i) => ({
    id: i.id,
    email: i.email,
    expiresAt: i.expires_at,
    createdAt: i.created_at,
    link: acceptUrl(i.token as string),
  }));

  return NextResponse.json({ invites });
}
