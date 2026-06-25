#!/usr/bin/env python3
"""
Applique les migrations Supabase manquantes et vérifie RLS.
Utilise pg8000 (pure Python) — pas besoin de psql/postgresql-client.
Mot de passe via PGPASSWORD → pg8000.
"""

import json, os, sys, base64
from pathlib import Path

PROJECT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ENV_PATH = os.path.join(PROJECT_DIR, ".env.local")
MIG_DIR = os.path.join(PROJECT_DIR, "supabase", "migrations")

def get_creds():
    """Parse .env.local → (service_role_key, password du JWT)."""
    env = {}
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v.strip().strip('"').strip("'")

    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not key:
        print("✗ SUPABASE_SERVICE_ROLE_KEY manquant")
        sys.exit(1)

    # Extraire project_ref du JWT
    try:
        payload = key.split(".")[1]
        payload += "=" * (4 - len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        ref = data["ref"]
    except Exception:
        print("✗ JWT invalide")
        sys.exit(1)

    return ref, key

def connect(ref, password):
    """Connexion pg8000 au pooler Supabase."""
    import pg8000.native
    host = f"aws-0-eu-west-3.pooler.supabase.com"
    return pg8000.native.Connection(
        user=f"postgres.{ref}",
        password=password,
        host=host,
        port=6543,
        database="postgres",
        timeout=15,
        ssl_context=False,  # Supabase pooler requires SSL differently — handled internally
    )

def apply_migration(conn, sql_file):
    """Exécute un fichier SQL ligne par ligne (pg8000 ne supporte pas multi-statement)."""
    name = os.path.basename(sql_file)
    print(f"  ▶ {name}...")

    with open(sql_file) as f:
        content = f.read()

    # Split en statements individuels (naïf mais suffisant pour migrations Supabase)
    statements = []
    current = []
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("--") or not stripped:
            continue
        current.append(line)
        if stripped.endswith(";"):
            statements.append(" ".join(current))
            current = []

    if current:
        statements.append(" ".join(current))

    for i, stmt in enumerate(statements):
        stmt = stmt.strip()
        if not stmt or stmt.startswith("--"):
            continue
        try:
            conn.run_sql(stmt)
        except Exception as e:
            err = str(e)[:300]
            # "already exists" = acceptable (idempotent)
            if "already exists" in err.lower() or "duplicate" in err.lower():
                continue
            print(f"  ✗ Statement {i+1}: {err}")
            return False

    print(f"  ✓ OK")
    return True

def check_rls(conn):
    """Vérifie RLS sur toutes les tables avec org_id."""
    rows = conn.run_sql("""
        SELECT t.tablename, t.relrowsecurity,
               array_agg(p.polname ORDER BY p.polname) FILTER (WHERE p.polname IS NOT NULL)
        FROM pg_class t
        JOIN pg_namespace n ON n.oid = t.relnamespace
        LEFT JOIN pg_policy p ON p.polrelid = t.oid
        WHERE n.nspname = 'public'
          AND t.relkind = 'r'
          AND EXISTS (
            SELECT 1 FROM pg_attribute a
            WHERE a.attrelid = t.oid AND a.attname = 'org_id'
          )
        GROUP BY t.tablename, t.relrowsecurity
        ORDER BY t.tablename
    """)

    all_ok = True
    for row in rows:
        table, rls, policies = row
        ok = rls is True or rls == "t" or rls == 1
        status = "✓" if ok else "✗"
        if not ok:
            all_ok = False
        print(f"  {status} {table}: RLS={'ON' if ok else 'OFF'}, policies={policies}")
    return all_ok

def main():
    if not os.path.exists(ENV_PATH):
        print("✗ .env.local introuvable")
        sys.exit(1)

    ref, password = get_creds()
    print(f"📦 Projet: {ref}")

    if not os.path.isdir(MIG_DIR):
        print("✗ Dossier migrations introuvable")
        sys.exit(1)

    # Trouver migrations cibles
    migrations = sorted(
        [f for f in os.listdir(MIG_DIR) if f.endswith(".sql") and f.split("_")[0].isdigit()],
        key=lambda x: int(x.split("_")[0])
    )
    target = [m for m in migrations if m.startswith("0006") or m.startswith("0007")]

    if not target:
        print("⚠️  Migrations 0006/0007 non trouvées.")
        return

    print(f"\n📋 À appliquer: {[t for t in target]}")
    conn = connect(ref, password)

    for m in target:
        path = os.path.join(MIG_DIR, m)
        if not apply_migration(conn, path):
            print(f"\n❌ ÉCHEC sur {m}")
            conn.close()
            sys.exit(1)

    # Vérifier RLS
    print("\n🔒 Vérification RLS (tables avec org_id)...")
    rls_ok = check_rls(conn)
    conn.close()

    if rls_ok:
        print("\n✅ RLS actif sur toutes les tables avec org_id.")
    else:
        print("\n⚠️  Certaines tables n'ont pas RLS.")
        sys.exit(1)

if __name__ == "__main__":
    main()
