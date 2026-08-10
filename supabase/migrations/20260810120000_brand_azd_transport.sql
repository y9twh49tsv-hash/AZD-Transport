-- =============================================================================
-- AZD Transport — Marke und Nummernpräfix angleichen
-- =============================================================================
-- Sendungsnummern werden in der Datenbank vergeben, nicht in der Anwendung.
-- Marke und Präfix stehen deshalb in app_settings und müssen beim Umbenennen
-- mitgezogen werden — sonst zeigt die Website „AZD Transport“, während die
-- Nummern weiter mit MC- beginnen.
--
-- Bereits vergebene Nummern bleiben unverändert. Eine Sendungsnummer ist die
-- Referenz, unter der eine Kundin ihr Paket sucht und die auf dem aufgeklebten
-- Etikett steht; sie nachträglich umzuschreiben würde jedes gedruckte Etikett
-- entwerten. Die Sendungsverfolgung akzeptiert jedes Präfix aus zwei bis fünf
-- Großbuchstaben, alte und neue Nummern funktionieren also nebeneinander.
-- =============================================================================

alter table public.app_settings
  alter column brand_name set default 'AZD Transport',
  alter column tracking_prefix set default 'AZD';

update public.app_settings
   set brand_name = 'AZD Transport',
       tracking_prefix = 'AZD',
       updated_at = now()
 where tracking_prefix = 'MC';

-- Der Tageszähler in tracking_counters ist über (prefix, day) eindeutig. Mit
-- einem neuen Präfix beginnt die laufende Nummer des Tages deshalb wieder bei
-- 0001 — AZD-260810-0001 kann neben einem schon vergebenen MC-260810-0003
-- stehen. Das ist unkritisch: die Eindeutigkeit hängt an der vollständigen
-- Nummer, und die enthält das Präfix.
