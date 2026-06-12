// ════════════════════════════════════════════════════════════════════════
// Audit RLS — règle d'or n°2 rendue mécanique.
// ────────────────────────────────────────────────────────────────────────
// Usage :
//   node --env-file=.env.local scripts/check-rls.mjs
//
// Échoue (exit 1) si :
//   • UNE table de public.* a la RLS désactivée (elle est exposée à l'API), ou
//   • une table à colonne org_id n'a aucune policy.
// Avertit sur les tables sans org_id (racine `organizations`, tables internes) :
//   à vérifier à la main (RLS activée sans policy = verrouillée, c'est OK).
// ════════════════════════════════════════════════════════════════════════

import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString || connectionString.includes("<")) {
  console.error("\n  ✗ SUPABASE_DB_URL manquant dans .env.local.\n");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  // `?sslmode=disable` dans l'URL → pas de TLS (Postgres local de la CI).
  ssl: connectionString.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
});

const SQL = `
  select
    c.relname                              as table_name,
    c.relrowsecurity                       as rls_enabled,
    count(distinct p.polname)              as policy_count,
    bool_or(col.column_name = 'org_id')    as has_org_id
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  left join information_schema.columns col
    on col.table_schema = 'public'
   and col.table_name = c.relname
  where n.nspname = 'public'
    and c.relkind = 'r'
  group by c.relname, c.relrowsecurity
  order by c.relname;
`;

async function main() {
  await client.connect();
  const { rows } = await client.query(SQL);
  await client.end();

  if (rows.length === 0) {
    console.log("\n  Aucune table applicative dans public. Rien à auditer.\n");
    return;
  }

  let failures = 0;
  let warnings = 0;

  console.log("\n  Table                          RLS   Policies   org_id");
  console.log("  ─────────────────────────────────────────────────────────");
  for (const r of rows) {
    const rls = r.rls_enabled ? "ON " : "OFF";
    const pad = (s, n) => String(s).padEnd(n);
    const orgId = r.has_org_id ? "oui" : "non";
    let flag = "";

    if (!r.rls_enabled) {
      flag = "  ✗ RLS désactivée (table public exposée à l'API)";
      failures++;
    } else if (r.has_org_id && Number(r.policy_count) === 0) {
      flag = "  ✗ org_id sans policy";
      failures++;
    } else if (r.has_org_id) {
      flag = "  ✓";
    } else {
      flag = "  ⚠ pas d'org_id (racine/interne — vérifier)";
      warnings++;
    }

    console.log(
      `  ${pad(r.table_name, 30)} ${rls}   ${pad(r.policy_count, 8)}   ${pad(orgId, 4)}${flag}`,
    );
  }

  console.log("");
  if (failures > 0) {
    console.error(`  ✗ ${failures} table(s) non isolée(s). Corrige avant de commit/déployer.\n`);
    process.exit(1);
  }
  console.log(
    `  ✓ Isolation OK sur toutes les tables à org_id.` +
      (warnings ? ` (${warnings} table(s) sans org_id à vérifier.)` : "") +
      "\n",
  );
}

main().catch(async (err) => {
  console.error(err);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
