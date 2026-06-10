// ════════════════════════════════════════════════════════════════════════
// Audit RLS — règle d'or n°2 rendue mécanique.
// ────────────────────────────────────────────────────────────────────────
// Usage :
//   node --env-file=.env.local scripts/check-rls.mjs
//
// Échoue (exit 1) si une table public.* qui porte une colonne org_id n'a pas :
//   • la Row Level Security ACTIVÉE, et
//   • au moins une policy.
// Avertit aussi sur les tables sans org_id non couvertes (à vérifier à la main).
// Les tables internes (préfixe « _ ») sont ignorées.
// ════════════════════════════════════════════════════════════════════════

import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString || connectionString.includes("<")) {
  console.error("\n  ✗ SUPABASE_DB_URL manquant dans .env.local.\n");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
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
    and c.relname not like '\\_%'
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

    if (r.has_org_id) {
      if (!r.rls_enabled) {
        flag = "  ✗ RLS désactivée";
        failures++;
      } else if (Number(r.policy_count) === 0) {
        flag = "  ✗ aucune policy";
        failures++;
      } else {
        flag = "  ✓";
      }
    } else {
      flag = "  ⚠ pas d'org_id (à vérifier)";
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
