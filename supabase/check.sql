-- =============================================================================
-- MaroCargo — Ist die Datenbank richtig eingerichtet?
-- =============================================================================
-- Liest nur, ändert nichts. Im Supabase SQL Editor einfügen und ausführen.
--
-- Erwartetes Ergebnis auf einer fertig eingerichteten Datenbank:
--
--   pruefung                     | ist      | soll     | ok
--   -----------------------------+----------+----------+----
--   Tabellen                     | 17       | 17       | t
--   Funktionen                   | 19       | >= 19    | t
--   Storage-Buckets (privat)     | 3        | 3        | t
--   Tabellen ohne RLS            | 0        | 0        | t
--   Oeffentliches Tracking       | vorhanden| vorhanden| t
--   Trigger fuer neue Konten     | vorhanden| vorhanden| t
--
-- Steht in der Spalte "ok" irgendwo f (false), ist die Einrichtung
-- unvollständig: erst supabase/reset.sql ausführen, dann supabase/setup.sql.
-- =============================================================================

with erwartete_tabellen(name) as (
  values ('app_settings'), ('attachments'), ('audit_logs'), ('bulky_item_requests'),
         ('customers'), ('notification_logs'), ('payments'), ('pickup_assignments'),
         ('profiles'), ('security_seals'), ('shipment_items'), ('shipments'),
         ('tracking_counters'), ('tracking_events'), ('trip_shipments'), ('trips'),
         ('vehicles')
),
werte as (
  select
    (select count(*) from erwartete_tabellen e
       where to_regclass('public.' || quote_ident(e.name)) is not null) as tabellen,
    (select count(*) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public') as funktionen,
    (select count(*) from storage.buckets
      where id in ('shipment-photos', 'bulky-photos', 'signatures')
        and public is false) as buckets,
    (select count(*) from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity is false) as ohne_rls,
    (to_regprocedure('public.get_public_tracking(text)') is not null) as tracking_da,
    (exists (select 1 from pg_trigger where tgname = 'on_auth_user_created')) as trigger_da
)
select 'Tabellen'                  as pruefung, tabellen::text    as ist, '17'::text       as soll, tabellen = 17    as ok from werte
union all
select 'Funktionen',                funktionen::text,               '>= 19',                funktionen >= 19      from werte
union all
select 'Storage-Buckets (privat)',  buckets::text,                  '3',                    buckets = 3           from werte
union all
select 'Tabellen ohne RLS',         ohne_rls::text,                 '0',                    ohne_rls = 0          from werte
union all
select 'Oeffentliches Tracking',    case when tracking_da then 'vorhanden' else 'fehlt' end, 'vorhanden', tracking_da from werte
union all
select 'Trigger fuer neue Konten',  case when trigger_da then 'vorhanden' else 'fehlt' end, 'vorhanden', trigger_da  from werte;
