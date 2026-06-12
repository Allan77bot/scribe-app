// ════════════════════════════════════════════════════════════════════════
// Application des migrations SQL — connexion Postgres directe (Supabase).
// ────────────────────────────────────────────────────────────────────────
// Usage :
//   node --env-file=.env.local scripts/db-apply.mjs
//
// • Lit toutes les migrations dans supabase/migrations/ (ordre alphabétique).
// • Tient un journal public._scribe_migrations → idempotent (rejoue sans risque).
// • Chaque migration s'applique dans UNE transaction (tout ou rien).
// Ne nécessite que SUPABASE_DB_URL (aucun token d'accès Supabase requis).
// ════════════════════════════════════════════════════════════════════════

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString || connectionString.includes("<")) {
  console.error(
    "\n  ✗ SUPABASE_DB_URL manquant ou non rempli dans .env.local.\n" +
      "    Dashboard → Settings → Database → Connection string → URI.\n",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  // Supabase impose TLS ; le certificat est valide mais on reste tolérant.
  // `?sslmode=disable` dans l'URL → pas de TLS (Postgres local de la CI).
  ssl: connectionString.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  // Journal des migrations appliquées.
  await client.query(`
    create table if not exists public._scribe_migrations (
      name        text primary key,
      applied_at  timestamptz not null default now()
    );
  `);
  // RLS activée sans policy : table interne, inaccessible via l'API (anon/authenticated).
  // Seuls les outils à droits élevés (ce script, le service_role) y accèdent.
  await client.query(
    "alter table public._scribe_migrations enable row level security;",
  );

  const { rows } = await client.query("select name from public._scribe_migrations");
  const applied = new Set(rows.map((r) => r.name));

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  • ${file} — déjà appliquée, ignorée`);
      continue;
    }
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`  → ${file} … `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into public._scribe_migrations (name) values ($1)",
        [file],
      );
      await client.query("commit");
      console.log("OK");
      count++;
    } catch (err) {
      await client.query("rollback");
      console.error(`ÉCHEC\n\n${err.message}\n`);
      process.exit(1);
    }
  }

  console.log(
    count === 0
      ? "\n  ✓ Base déjà à jour, aucune migration à appliquer.\n"
      : `\n  ✓ ${count} migration(s) appliquée(s).\n`,
  );
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
