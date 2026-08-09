#!/usr/bin/env bash
#
# Runs the Supabase migrations against a throwaway PostgreSQL database and
# asserts the security guarantees the application relies on.
#
#   ./scripts/verify-db.sh                        # uses a local server on :5433
#   PGHOST=/tmp PGPORT=5433 ./scripts/verify-db.sh
#
# Requires a running PostgreSQL 15+ and psql on the PATH. It never touches your
# Supabase project — everything happens in a database called `marocargo_test`
# that is dropped and recreated on every run.
#
set -euo pipefail

PGHOST="${PGHOST:-/tmp}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
DB="${DB:-marocargo_test}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export PGHOST PGPORT PGUSER

psql_run() { psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$1"; }

echo "▸ Datenbank $DB neu anlegen"
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists $DB;" >/dev/null
psql -v ON_ERROR_STOP=1 -q -d postgres -c "create database $DB;" >/dev/null

echo "▸ Supabase-Umgebung nachbilden"
psql_run "$ROOT/scripts/test-db-bootstrap.sql"

echo "▸ Migrationen ausführen"
for file in "$ROOT"/supabase/migrations/*.sql; do
  echo "  · $(basename "$file")"
  psql_run "$file"
done

echo "▸ Seed-Daten laden"
psql_run "$ROOT/supabase/seed.sql"

echo "▸ Prüfungen"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$ROOT/scripts/verify-db.sql" 2>&1 |
  sed -n 's/^NOTICE:  /  /p'

echo "▸ Alle Datenbankprüfungen bestanden"
