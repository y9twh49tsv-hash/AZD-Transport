#!/usr/bin/env bash
#
# Runs the Supabase migrations against a throwaway PostgreSQL database and
# asserts the security guarantees the application relies on.
#
#   ./scripts/verify-db.sh                        # uses a local server on :5433
#   PGHOST=/tmp PGPORT=5433 ./scripts/verify-db.sh
#
# Requires a running PostgreSQL 15+ and psql on the PATH. It never touches your
# Supabase project — everything happens in a database called `azd_transport_test`
# that is dropped and recreated on every run.
#
set -euo pipefail

PGHOST="${PGHOST:-/tmp}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
DB="${DB:-azd_transport_test}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export PGHOST PGPORT PGUSER

LOG_DIR="$(mktemp -d)"
trap 'rm -rf "$LOG_DIR"' EXIT

psql_run() { psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$1"; }

# Nur Warnungen und Fehler zeigen. Ohne das schüttet `drop schema … cascade`
# aus reset.sql 50 Zeilen "drop cascades to …" über die Ausgabe.
psql_quiet() {
  PGOPTIONS='-c client_min_messages=warning' psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$1"
}

# Führt die Zusicherungen aus und gibt ihre NOTICE-Zeilen aus.
#
# Die Ausgabe darf nicht durch eine Pipe laufen: psql stünde dann am Anfang
# der Pipeline, und `set -e` sieht nur den Rückgabewert des letzten Glieds —
# eine fehlgeschlagene Zusicherung wäre stillschweigend durchgegangen, und das
# Skript hätte am Ende "Alle Datenbankprüfungen bestanden" gemeldet. Deshalb
# erst in eine Datei schreiben, Rückgabewert prüfen, dann anzeigen.
#
# Der sed-Ausdruck darf sich außerdem nicht an den Zeilenanfang klammern:
# psql stellt jeder Meldung "psql:datei:zeile: " voran.
run_assertions() {
  local log="$1"
  if ! psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$ROOT/scripts/verify-db.sql" >"$log" 2>&1; then
    echo "✗ Eine Zusicherung ist fehlgeschlagen:" >&2
    cat "$log" >&2
    exit 1
  fi
  sed -n 's/.*NOTICE:  OK  /  ✓ /p' "$log"
}

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
run_assertions "$LOG_DIR/assertions.log"

# ---------------------------------------------------------------------------
# reset.sql + setup.sql
# ---------------------------------------------------------------------------
# setup.sql wird aus den Migrationen erzeugt und reset.sql räumt sie wieder ab.
# Beide werden nur im Supabase SQL Editor benutzt, also nie im normalen Ablauf
# hier — ohne diesen Abschnitt würde eine neue Migration sie unbemerkt
# veralten lassen. Dass die Rechte nach dem Zurücksetzen wieder stimmen, ist
# der heikle Teil: fehlen sie, meldet die API "permission denied for table",
# obwohl jede Tabelle da ist.
echo "▸ reset.sql → setup.sql (Zurücksetzen und neu einrichten)"
psql_quiet "$ROOT/supabase/reset.sql" >/dev/null
psql_quiet "$ROOT/supabase/setup.sql" >/dev/null
psql_quiet "$ROOT/supabase/seed.sql"  >/dev/null
run_assertions "$LOG_DIR/assertions-after-reset.log" | sed 's/^/ /'

# reinstall.sql ist die Datei für den häufigsten Stolperstein: eine Datenbank,
# in der setup.sql schon einmal lief. Sie muss deshalb genau dort funktionieren,
# wo setup.sql scheitert — auf einer bereits eingerichteten Datenbank, und auch
# beim zweiten Durchlauf.
echo "▸ reinstall.sql auf einer bereits eingerichteten Datenbank"
psql_quiet "$ROOT/supabase/reinstall.sql" >/dev/null
psql_quiet "$ROOT/supabase/reinstall.sql" >/dev/null
psql_quiet "$ROOT/supabase/seed.sql"      >/dev/null
run_assertions "$LOG_DIR/assertions-after-reinstall.log" | sed -n '$p' | sed 's/^/ /'
echo "   ✓ zweimal hintereinander fehlerfrei"

# Die Rechte hängen am Schema public und werden von `drop schema … cascade`
# mitgelöscht. Stellt reset.sql sie nicht wieder her, ist jede Tabelle da und
# die Anwendung trotzdem tot: "permission denied for table shipments".
psql -v ON_ERROR_STOP=1 -q -d "$DB" -c "
  do \$\$
  begin
    if not (
      has_table_privilege('anon', 'public.shipments', 'select') and
      has_table_privilege('authenticated', 'public.shipments', 'select') and
      has_function_privilege('anon', 'public.get_public_tracking(text)', 'execute')
    ) then
      raise exception 'Nach reset.sql fehlen die Tabellenrechte';
    end if;
    raise notice 'OK  Rechte nach dem Zurücksetzen wiederhergestellt';
  end \$\$;" > "$LOG_DIR/grants.log" 2>&1
sed -n 's/.*NOTICE:  OK  /   ✓ /p' "$LOG_DIR/grants.log"

# check.sql ist das, was im Supabase SQL Editor eingefügt wird, um eine
# Einrichtung zu beurteilen. Hier läuft es gegen eine nachweislich korrekte
# Datenbank — jede Zeile muss auf t enden, sonst meldet es später einen
# Fehlalarm oder übersieht eine kaputte Einrichtung.
echo "▸ check.sql (Einrichtungsprüfung für den SQL Editor)"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -At -F ' | ' -f "$ROOT/supabase/check.sql" \
  > "$LOG_DIR/check.log"
if grep -q ' | f$' "$LOG_DIR/check.log"; then
  echo "  ✗ check.sql meldet eine unvollständige Einrichtung:" >&2
  cat "$LOG_DIR/check.log" >&2
  exit 1
fi
sed 's/ | t$//; s/^/  ✓ /' "$LOG_DIR/check.log"

# ---------------------------------------------------------------------------
# make-admin.sql
# ---------------------------------------------------------------------------
# Das Skript, mit dem das erste Admin-Konto entsteht — der einzige Weg in den
# Verwaltungsbereich. Geprüft werden die vier Situationen, in denen es benutzt
# wird, samt der Zusage, dass ein gelöschtes Konto keine Sendungen mitnimmt.
echo "▸ make-admin.sql"
ADMIN_MAIL="$(sed -n "s/.*v_email *text *:= *'\([^']*\)'.*/\1/p" "$ROOT/supabase/make-admin.sql" | head -1)"

# Nicht in eine Pipe schreiben: das Skript läuft mit `pipefail`, und beim
# erwarteten Abbruch liefert psql einen Fehlercode, der dann die ganze
# Pipeline scheitern lässt — auch wenn grep den gesuchten Text gefunden hat.
admin_run() { psql -q -d "$DB" -f "$ROOT/supabase/make-admin.sql" > "$LOG_DIR/admin.log" 2>&1 || true; }
admin_role() { psql -v ON_ERROR_STOP=1 -q -d "$DB" -At -c "select role from public.profiles;"; }
expect() {
  if [ "$2" != "$3" ]; then
    echo "  ✗ $1: erwartet '$3', bekommen '$2'" >&2
    exit 1
  fi
  echo "  ✓ $1"
}

psql -v ON_ERROR_STOP=1 -q -d "$DB" -c "delete from auth.users;" >/dev/null

# 1) Ohne Konto muss es abbrechen statt stillschweigend nichts zu tun.
admin_run
if ! grep -q "Es gibt kein Konto" "$LOG_DIR/admin.log"; then
  echo "  ✗ meldet ein fehlendes Konto nicht:" >&2
  cat "$LOG_DIR/admin.log" >&2
  exit 1
fi
echo "  ✓ fehlendes Konto wird gemeldet"

# 2) Der Normalfall: Konto im Dashboard angelegt, Trigger legt das Profil an.
psql -v ON_ERROR_STOP=1 -q -d "$DB" \
  -c "insert into auth.users (email, email_confirmed_at) values ('$ADMIN_MAIL', now());" >/dev/null
admin_run
expect "customer wird zu admin" "$(admin_role)" "admin"

# 3) Zweiter Lauf darf nichts kaputt machen.
admin_run
expect "zweiter Lauf bleibt folgenlos" "$(admin_role)" "admin"

# 4) Konto ohne Profil — etwa älter als die Datenbank.
psql -v ON_ERROR_STOP=1 -q -d "$DB" -c "delete from public.profiles;" >/dev/null
admin_run
expect "fehlendes Profil wird angelegt" "$(admin_role)" "admin"

# 5) Ein gelöschtes Konto darf keine Geschäftsdaten mitnehmen: alle Verweise
#    auf profiles stehen auf SET NULL. Sonst würde das Entfernen einer
#    Mitarbeiterin deren Sendungen aus dem Bestand reißen.
BEFORE="$(psql -At -d "$DB" -c "select count(*) from shipments;")"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -c "delete from auth.users;" >/dev/null
expect "Sendungen überleben das Löschen des Kontos" \
  "$(psql -At -d "$DB" -c "select count(*) from shipments;")" "$BEFORE"

echo "▸ Alle Datenbankprüfungen bestanden"
