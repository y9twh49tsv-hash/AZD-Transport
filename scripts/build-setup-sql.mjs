/**
 * Regenerates the two files that get pasted into the Supabase SQL editor.
 *
 *   supabase/setup.sql      all migrations in order — for a fresh project
 *   supabase/reinstall.sql  reset.sql followed by setup.sql — rebuilds a
 *                           database that already has (part of) the schema
 *
 * Both are convenience artefacts; the migrations stay the source of truth.
 * Run this whenever you add or change one, so the copies never drift apart.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'supabase/migrations';
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

const count = files.length;

const setupHeader = `-- =============================================================================
-- AZD Transport — komplette Einrichtung in einem Durchgang
-- =============================================================================
-- Diese Datei ist die Aneinanderreihung aller ${count} Migrationen aus
-- supabase/migrations/ in der richtigen Reihenfolge. Sie existiert nur der
-- Bequemlichkeit halber: einmal in den Supabase SQL Editor einfügen und
-- ausführen, statt ${count} Dateien nacheinander.
--
-- Die einzelnen Migrationsdateien bleiben die maßgebliche Quelle. Wenn du dort
-- etwas änderst, erzeuge diese Datei neu:
--     npm run build:setup-sql
--
-- NUR für ein FRISCHES Supabase-Projekt. Ein zweiter Lauf schlägt mit
-- »type "user_role" already exists« fehl, weil Typen und Tabellen dann schon
-- da sind — das ist Absicht und schützt vor versehentlichem Überschreiben.
--
-- Läuft schon etwas in der Datenbank? Dann nimm supabase/reinstall.sql.
-- =============================================================================

`;

const reinstallHeader = `-- =============================================================================
-- AZD Transport — Datenbank komplett neu aufbauen
-- =============================================================================
--   ⚠️  ALLE DATEN WERDEN GELÖSCHT: Sendungen, Kunden, Fahrten, Historie.
--       Nur benutzen, solange noch keine echten Aufträge erfasst sind.
--
-- Diese Datei ist reset.sql gefolgt von setup.sql. Sie funktioniert in jedem
-- Zustand — ob die Datenbank leer ist, halb eingerichtet oder vollständig.
-- Genau ein Einfügen, genau ein Klick auf Run.
--
-- Danach: supabase/check.sql ausführen. Dort muss in der Spalte "ok" überall
-- true stehen.
--
-- Erhalten bleiben die Anmeldedaten in auth.users. Die zugehörigen Profile
-- sind danach weg, wer sich also vorher registriert hatte, hat keine Rolle
-- mehr. Willst du auch dort bei null anfangen:
--     delete from auth.users;
-- =============================================================================

`;

function section(title, sql) {
  return (
    `\n\n-- ###########################################################################\n` +
    `-- ## ${title}\n` +
    `-- ###########################################################################\n\n` +
    sql
  );
}

const migrations = files
  .map((name) => section(name, readFileSync(join(dir, name), 'utf8')))
  .join('');

writeFileSync('supabase/setup.sql', setupHeader + migrations);

const reset = readFileSync('supabase/reset.sql', 'utf8');
writeFileSync(
  'supabase/reinstall.sql',
  reinstallHeader + section('reset.sql — alles Bisherige entfernen', reset) + migrations,
);

console.log(`setup.sql und reinstall.sql neu erzeugt aus ${count} Migrationen`);
