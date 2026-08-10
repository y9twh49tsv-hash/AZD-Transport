/**
 * Regenerates supabase/setup.sql from the migrations.
 *
 * setup.sql is a convenience artefact: one paste into the Supabase SQL editor
 * instead of five. The migrations stay the source of truth — run this whenever
 * you add or change one, so the two never drift apart.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'supabase/migrations';
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

const header = `-- =============================================================================
-- MaroCargo — komplette Einrichtung in einem Durchgang
-- =============================================================================
-- Diese Datei ist die Aneinanderreihung aller Migrationen aus
-- supabase/migrations/ in der richtigen Reihenfolge. Sie existiert nur der
-- Bequemlichkeit halber: einmal in den Supabase SQL Editor einfügen und
-- ausführen, statt fünf Dateien nacheinander.
--
-- Die einzelnen Migrationsdateien bleiben die maßgebliche Quelle. Wenn du dort
-- etwas änderst, erzeuge diese Datei neu:
--     npm run build:setup-sql
--
-- Einmalig auszuführen auf einem FRISCHEN Supabase-Projekt. Ein zweiter Lauf
-- schlägt fehl, weil Tabellen und Typen dann bereits existieren — das ist
-- Absicht und schützt vor versehentlichem Überschreiben.
-- =============================================================================

`;

const body = files
  .map(
    (name) =>
      `\n\n-- ###########################################################################\n` +
      `-- ## ${name}\n` +
      `-- ###########################################################################\n\n` +
      readFileSync(join(dir, name), 'utf8'),
  )
  .join('');

writeFileSync('supabase/setup.sql', header + body);
console.log(`setup.sql regenerated from ${files.length} migrations`);
