// ════════════════════════════════════════════════════════════════════════
// Test d'isolation inter-organisation — critère de mise en production (brief §8)
// ────────────────────────────────────────────────────────────────────────
// Prouve qu'une org ne lit JAMAIS les données d'une autre (RLS sur org_id).
// Usage : node --env-file=.env.local --test tests/isolation.test.mjs
//         (ou : npm run test:isolation)
//
// Crée 2 utilisateurs (→ 2 orgs via le trigger), se connecte en tant que A,
// et vérifie que A ne voit que ses propres lignes. Nettoie tout à la fin.
// ════════════════════════════════════════════════════════════════════════

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const configured =
  URL && ANON && SERVICE && ![URL, ANON, SERVICE].some((v) => v.includes("<"));
const skip = configured
  ? false
  : "Clés Supabase absentes de .env.local — test ignoré (remplir puis relancer).";

const stamp = Date.now();
const A = {
  email: `iso-a-${stamp}@scribe.test`,
  password: `A-pass-${stamp}!`,
  org: `Org A ${stamp}`,
};
const B = {
  email: `iso-b-${stamp}@scribe.test`,
  password: `B-pass-${stamp}!`,
  org: `Org B ${stamp}`,
};

let admin;
const created = { users: [], orgs: [] };

before(async () => {
  if (!configured) return;
  admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const u of [A, B]) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { org_name: u.org, display_name: u.email.split("@")[0] },
    });
    assert.equal(error, null, `création user ${u.email} : ${error?.message}`);
    u.id = data.user.id;
    created.users.push(u.id);
  }

  // Récupère les org_id créés par le trigger (service_role contourne la RLS).
  for (const u of [A, B]) {
    const { data } = await admin
      .from("organizations")
      .select("id")
      .eq("name", u.org)
      .single();
    u.orgId = data?.id;
    if (u.orgId) created.orgs.push(u.orgId);
  }
});

after(async () => {
  if (!configured || !admin) return;
  for (const id of created.users) {
    await admin.auth.admin.deleteUser(id); // cascade → public.users
  }
  if (created.orgs.length) {
    await admin.from("organizations").delete().in("id", created.orgs);
  }
});

test("le trigger crée bien une org + un profil admin par inscrit", { skip }, () => {
  assert.ok(A.id && B.id, "les deux comptes existent");
  assert.ok(A.orgId && B.orgId, "les deux orgs ont été créées");
  assert.notEqual(A.orgId, B.orgId, "les orgs sont distinctes");
});

test("org A ne voit QUE ses propres lignes (users + organizations)", { skip }, async () => {
  const a = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await a.auth.signInWithPassword({
    email: A.email,
    password: A.password,
  });
  assert.equal(error, null, "connexion de A");

  const { data: usersSeen } = await a.from("users").select("id, email");
  assert.equal(usersSeen.length, 1, "A ne voit qu'un utilisateur (lui-même)");
  assert.equal(usersSeen[0].email, A.email);

  const { data: orgsSeen } = await a.from("organizations").select("id, name");
  assert.equal(orgsSeen.length, 1, "A ne voit qu'une org (la sienne)");
  assert.equal(orgsSeen[0].name, A.org);
});

test("org A ne peut PAS lire l'org B, même en ciblant son id", { skip }, async () => {
  const a = createClient(URL, ANON, { auth: { persistSession: false } });
  await a.auth.signInWithPassword({ email: A.email, password: A.password });

  const { data: leakedOrg } = await a
    .from("organizations")
    .select("id")
    .eq("id", B.orgId);
  assert.equal(leakedOrg.length, 0, "RLS bloque la lecture de l'org B");

  const { data: leakedUser } = await a
    .from("users")
    .select("id")
    .eq("email", B.email);
  assert.equal(leakedUser.length, 0, "RLS bloque la lecture des membres de B");
});

// Non-régression : la faille critique invite_org_id (corrigée). Un attaquant qui
// injecte un org_id existant via les métadonnées du signUp ne doit PAS rejoindre
// cette org — le trigger l'ignore et lui crée sa propre org.
test("le trigger IGNORE un invite_org_id injecté (anti-fuite d'isolation)", { skip }, async () => {
  const attacker = {
    email: `iso-attacker-${stamp}@scribe.test`,
    password: `X-pass-${stamp}!`,
    org: `Attacker ${stamp}`,
  };
  const { data, error } = await admin.auth.admin.createUser({
    email: attacker.email,
    password: attacker.password,
    email_confirm: true,
    // Tentative d'injection : rejoindre l'org B sans permission.
    user_metadata: { org_name: attacker.org, invite_org_id: B.orgId },
  });
  assert.equal(error, null, `création attaquant : ${error?.message}`);
  created.users.push(data.user.id);

  const { data: row } = await admin
    .from("users")
    .select("org_id")
    .eq("id", data.user.id)
    .single();
  assert.notEqual(row.org_id, B.orgId, "l'invite_org_id injecté doit être ignoré");

  const { data: itsOrg } = await admin
    .from("organizations")
    .select("id, name")
    .eq("id", row.org_id)
    .single();
  if (itsOrg?.id) created.orgs.push(itsOrg.id);
  assert.equal(itsOrg.name, attacker.org, "l'attaquant obtient sa propre org neuve");
});
