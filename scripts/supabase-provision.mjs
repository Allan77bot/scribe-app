// ════════════════════════════════════════════════════════════════════════
// Provisioning Supabase via l'API de gestion (Management API).
// ────────────────────────────────────────────────────────────────────────
// Crée le projet (région EU), attend qu'il soit sain, applique les migrations
// SQL (via l'endpoint /database/query — pas besoin de connexion Postgres
// directe, donc pas de souci IPv4/pooler), recupere les cles, et ecrit .env.local.
//
// Usage :
//   node --env-file=.env.local scripts/supabase-provision.mjs
// Requiert dans .env.local (ou l'environnement) :
//   SUPABASE_ACCESS_TOKEN   (Personal Access Token — https://supabase.com/dashboard/account/tokens)
// Optionnel :
//   SUPABASE_ORG_ID         (sinon : 1re organisation du compte)
//   SUPABASE_REGION         (defaut eu-central-1)
//   SUPABASE_PROJECT_NAME   (defaut scribe)
// ════════════════════════════════════════════════════════════════════════

import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import path from "node:path";

const API = "https://api.supabase.com";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REGION = process.env.SUPABASE_REGION || "eu-central-1";
const NAME = process.env.SUPABASE_PROJECT_NAME || "scribe";
let ORG_ID = process.env.SUPABASE_ORG_ID || "";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");
const ENV_LOCAL = path.join(ROOT, ".env.local");

if (!TOKEN || TOKEN.includes("<")) {
  console.error(
    "\n  ✗ SUPABASE_ACCESS_TOKEN manquant.\n" +
      "    Genere-le sur https://supabase.com/dashboard/account/tokens\n" +
      "    puis ajoute-le dans .env.local : SUPABASE_ACCESS_TOKEN=...\n",
  );
  process.exit(1);
}

async function api(method, urlPath, body) {
  const res = await fetch(API + urlPath, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${urlPath} → HTTP ${res.status}\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`,
    );
  }
  return data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Mot de passe DB fort, sûr dans une URI (alphabet base64url, pas de @ : / ?).
function strongPassword() {
  return randomBytes(24).toString("base64url");
}

async function main() {
  // 1. Organisation -------------------------------------------------------
  if (!ORG_ID) {
    const orgs = await api("GET", "/v1/organizations");
    if (!Array.isArray(orgs) || orgs.length === 0) {
      throw new Error("Aucune organisation Supabase sur ce compte.");
    }
    ORG_ID = orgs[0].id;
    console.log(`  • Organisation : ${orgs[0].name} (${ORG_ID})`);
    if (orgs.length > 1) {
      console.log(
        `    (${orgs.length} orgs trouvées ; 1re utilisée. Forcer via SUPABASE_ORG_ID.)`,
      );
    }
  }

  // 2. Création du projet -------------------------------------------------
  const dbPass = strongPassword();
  console.log(`  • Création du projet "${NAME}" en ${REGION} …`);
  const project = await api("POST", "/v1/projects", {
    name: NAME,
    organization_id: ORG_ID,
    region: REGION,
    db_pass: dbPass,
    plan: "free",
  });
  const ref = project.id || project.ref;
  if (!ref) throw new Error("Pas de project ref dans la réponse de création.");
  console.log(`    ref = ${ref}`);

  // 3. Attente jusqu'à ACTIVE_HEALTHY ------------------------------------
  process.stdout.write("  • Attente que le projet soit sain ");
  const deadline = Date.now() + 6 * 60 * 1000;
  let status = project.status;
  while (status !== "ACTIVE_HEALTHY" && Date.now() < deadline) {
    await sleep(5000);
    process.stdout.write(".");
    try {
      const p = await api("GET", `/v1/projects/${ref}`);
      status = p.status;
    } catch {
      // tolère quelques 4xx transitoires pendant le boot
    }
  }
  console.log(status === "ACTIVE_HEALTHY" ? " OK" : ` (statut: ${status})`);
  if (status !== "ACTIVE_HEALTHY") {
    throw new Error("Le projet n'est pas devenu sain dans le délai imparti.");
  }

  // 4. Récupération des clés API -----------------------------------------
  let keys = await api("GET", `/v1/projects/${ref}/api-keys?reveal=true`);
  if (!Array.isArray(keys)) keys = await api("GET", `/v1/projects/${ref}/api-keys`);
  const anon = keys.find((k) => k.name === "anon")?.api_key;
  const serviceRole = keys.find((k) => k.name === "service_role")?.api_key;
  if (!anon || !serviceRole) {
    throw new Error("Clés anon/service_role introuvables dans la réponse.");
  }

  const url = `https://${ref}.supabase.co`;
  const dbUrl = `postgresql://postgres:${dbPass}@db.${ref}.supabase.co:5432/postgres`;

  // 5. Application des migrations via l'API query -------------------------
  console.log("  • Application des migrations (via API) …");
  await query(ref, `
    create table if not exists public._scribe_migrations (
      name text primary key, applied_at timestamptz not null default now()
    );
  `);
  // Table interne : RLS activée sans policy → inaccessible via l'API publique.
  await query(ref, "alter table public._scribe_migrations enable row level security;");
  const appliedRows = await query(
    ref,
    "select name from public._scribe_migrations;",
  );
  const applied = new Set((appliedRows || []).map((r) => r.name));
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`    • ${file} — déjà appliquée`);
      continue;
    }
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`    → ${file} … `);
    await query(ref, sql);
    await query(ref, "insert into public._scribe_migrations (name) values ($tag$" + file + "$tag$);");
    console.log("OK");
  }

  // 6. Écriture de .env.local --------------------------------------------
  const envContent =
    `# ─────────────────────────────────────────────────────────────\n` +
    `# Scribe IA — secrets locaux. NON COMMITÉ (.gitignore).\n` +
    `# Généré par scripts/supabase-provision.mjs. Ne pas committer.\n` +
    `# ─────────────────────────────────────────────────────────────\n\n` +
    `NEXT_PUBLIC_SUPABASE_URL="${url}"\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY="${anon}"\n` +
    `SUPABASE_SERVICE_ROLE_KEY="${serviceRole}"\n` +
    `SUPABASE_DB_URL="${dbUrl}"\n` +
    `SUPABASE_PROJECT_REF="${ref}"\n\n` +
    `# Token de gestion (révocable). Garde-le ou supprime cette ligne après usage.\n` +
    `SUPABASE_ACCESS_TOKEN="${TOKEN}"\n`;
  await writeFile(ENV_LOCAL, envContent, "utf8");

  console.log("\n  ✓ Projet créé et migrations appliquées.");
  console.log(`    URL        : ${url}`);
  console.log(`    Project ref: ${ref}`);
  console.log(`    Région     : ${REGION}`);
  console.log("    Clés écrites dans .env.local (anon, service_role, db_url).");
  console.log(
    "\n  → Prochaine étape : npm run test:isolation  (puis tu peux révoquer le token).\n",
  );
}

// Exécute une requête SQL via la Management API (pas de connexion Postgres directe).
async function query(ref, sql) {
  const out = await api("POST", `/v1/projects/${ref}/database/query`, { query: sql });
  return out;
}

main().catch((err) => {
  console.error("\n  ✗ Échec du provisioning :\n" + err.message + "\n");
  process.exit(1);
});
