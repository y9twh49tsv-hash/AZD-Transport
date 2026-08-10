-- =============================================================================
-- AZD Transport — Datenbank zurücksetzen
-- =============================================================================
-- Löscht ALLES, was setup.sql angelegt hat, damit setup.sql danach wieder auf
-- einem sauberen Stand laufen kann.
--
--   ⚠️  ALLE SENDUNGEN, KUNDEN UND FAHRTEN WERDEN GELÖSCHT.
--       Nur benutzen, solange noch keine echten Daten in der Datenbank stehen.
--
-- Wann brauchst du das? Wenn setup.sql mit einer Meldung wie
-- »type "user_role" already exists« oder »relation "shipments" already exists«
-- abbricht — dann ist aus einem früheren Versuch noch etwas übrig.
--
-- Reihenfolge: erst diese Datei ausführen, dann setup.sql.
--
-- Nicht angefasst werden:
--   · die Anmeldedaten in auth.users (siehe Hinweis ganz unten)
--   · die Storage-Buckets — setup.sql aktualisiert sie ohnehin, statt sie
--     doppelt anzulegen, und beim Löschen hier blieben die Dateien im
--     Hintergrundspeicher trotzdem liegen.
-- =============================================================================

-- Der Trigger hängt an auth.users, also außerhalb des Schemas, das gleich
-- fällt. Er würde zwar mit der Funktion zusammen kaskadierend verschwinden,
-- aber verlassen wir uns nicht darauf.
drop trigger if exists on_auth_user_created on auth.users;

-- Tabellen, Typen, Funktionen, Trigger, Policies und Indizes hängen alle am
-- Schema public. Ein einziges Kommando räumt sie zusammen ab — deutlich
-- verlässlicher, als 17 Tabellen und 13 Typen einzeln aufzuzählen und dabei
-- eine neue Migration zu übersehen.
drop schema if exists public cascade;
create schema public;

-- -----------------------------------------------------------------------------
-- Rechte wiederherstellen
-- -----------------------------------------------------------------------------
-- Wichtig: Diese Rechte hängen am Schema und sind eben mitgelöscht worden.
-- Ohne sie kommt die Anwendung an keine einzige Tabelle heran — die API würde
-- »permission denied for table shipments« melden, obwohl alles da ist.
--
-- Das entspricht genau dem, was Supabase auf einem frischen Projekt einstellt.
-- Geschützt werden die Daten nicht durch diese Rechte, sondern durch Row Level
-- Security, die setup.sql auf jeder Tabelle einschaltet.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to postgres, anon, authenticated, service_role;

-- =============================================================================
-- Fertig. Jetzt supabase/setup.sql ausführen.
-- =============================================================================
--
-- Hinweis zu bereits registrierten Konten: Die Anmeldedaten in auth.users
-- bleiben erhalten, ihre Profile sind aber weg. Wer sich vorher registriert
-- hatte, kann sich zwar noch anmelden, hat aber keine Rolle mehr. Wenn du auch
-- damit bei null anfangen willst, führe zusätzlich aus:
--
--     delete from auth.users;
--
-- Danach registrierst du dich auf /registrieren neu und machst dich per SQL
-- zum Admin (siehe README, Schritt 8).
