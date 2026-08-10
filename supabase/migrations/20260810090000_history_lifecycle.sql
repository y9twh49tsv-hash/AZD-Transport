-- =============================================================================
-- MaroCargo — Trackinghistorie: unveränderlich, aber nicht unlöschbar
-- =============================================================================
-- Die ursprüngliche Regel war zu grob. Sie verbot jedes UPDATE und jedes DELETE
-- auf tracking_events und machte damit zwei völlig legitime Vorgänge unmöglich:
--
--   1. Ein Benutzerkonto löschen. Der Fremdschlüssel created_by steht auf
--      ON DELETE SET NULL, und dieses Nullsetzen ist ein UPDATE. Wer je einen
--      Status gesetzt hatte, ließ sich damit nicht mehr entfernen — auch nicht
--      auf Verlangen nach Art. 17 DSGVO.
--
--   2. Eine Sendung löschen. Der Fremdschlüssel shipment_id steht auf
--      ON DELETE CASCADE, und dieses Mitlöschen ist ein DELETE. Eine
--      Fehlbuchung blieb dadurch dauerhaft im Bestand.
--
-- Beides fiel erst im Betrieb auf, weil eine frische Datenbank keine Historie
-- hat, an der die Sperre greifen könnte.
--
-- Die Zusage, um die es eigentlich geht, bleibt unangetastet: Ein einmal
-- geschriebener Trackingeintrag darf inhaltlich nie wieder verändert und nie
-- einzeln entfernt werden. Erlaubt sind ab jetzt genau zwei Ausnahmen:
--
--   · das Anonymisieren des Urhebers (created_by → null), wobei kein anderes
--     Feld abweichen darf,
--   · das Mitlöschen, wenn die zugehörige Sendung nicht mehr existiert.
--
-- Die zweite Bedingung ist genauer als sie aussieht: PostgreSQL entfernt beim
-- Kaskadieren zuerst die Sendung und danach die abhängigen Zeilen. Innerhalb
-- des Löschvorgangs ist die Sendung also bereits weg, während sie bei einem
-- direkten `delete from tracking_events` noch da wäre. Genau daran lassen sich
-- die beiden Fälle unterscheiden.
-- =============================================================================

create or replace function public.block_tracking_event_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    -- Erlaubt: ausschließlich das Anonymisieren des Urhebers.
    if old.created_by is not null
       and new.created_by is null
       and new.id             is not distinct from old.id
       and new.shipment_id    is not distinct from old.shipment_id
       and new.status         is not distinct from old.status
       and new.occurred_at    is not distinct from old.occurred_at
       and new.location       is not distinct from old.location
       and new.public_message is not distinct from old.public_message
       and new.internal_note  is not distinct from old.internal_note
       and new.created_at     is not distinct from old.created_at
    then
      return new;
    end if;

    raise exception
      'Tracking-Events sind unveränderlich. Erlaubt ist nur das Anonymisieren '
      'des Urhebers beim Löschen eines Kontos.'
      using errcode = '42501';
  end if;

  -- tg_op = 'DELETE': nur zulässig, wenn die Sendung selbst schon fort ist.
  if not exists (select 1 from public.shipments s where s.id = old.shipment_id) then
    return old;
  end if;

  raise exception
    'Ein Tracking-Event darf nicht einzeln gelöscht werden. Lösche die Sendung, '
    'dann verschwindet ihre Historie mit ihr.'
    using errcode = '42501';
end;
$$;
