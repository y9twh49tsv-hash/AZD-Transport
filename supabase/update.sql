-- =============================================================================
-- MaroCargo — Nachtrag für eine bereits eingerichtete Datenbank
-- =============================================================================
-- Für den Fall, dass setup.sql schon einmal erfolgreich lief. Dieses Skript
-- bringt die Datenbank auf den aktuellen Stand und vergibt die Admin-Rolle.
--
-- Es löscht nichts und darf beliebig oft laufen.
--
-- Ist die Datenbank noch gar nicht eingerichtet, bricht es mit einem Hinweis
-- ab — dann gehört stattdessen reinstall.sql hierher.
-- =============================================================================

-- ▼▼▼ HIER DEINE E-MAIL-ADRESSE EINTRAGEN ▼▼▼
-- (dieselbe wie unter Authentication → Users)
create temporary table if not exists mc_admin_email as select 'mehdi90@outlook.de'::text as email;


-- -----------------------------------------------------------------------------
-- 0. Vorbedingung
-- -----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.tracking_events') is null then
    raise exception E'Die Datenbank ist noch nicht eingerichtet.\n'
      'Führe zuerst supabase/reinstall.sql aus, dann dieses Skript.';
  end if;
end $$;


-- -----------------------------------------------------------------------------
-- 1. Trackinghistorie: unveränderlich, aber nicht unlöschbar
-- -----------------------------------------------------------------------------
-- Die ursprüngliche Regel verbot jedes UPDATE und DELETE auf tracking_events
-- und machte damit zwei nötige Vorgänge unmöglich: ein Benutzerkonto löschen
-- (created_by wird per SET NULL genullt — ein UPDATE) und eine Sendung löschen
-- (die Historie geht per CASCADE mit — ein DELETE).
--
-- Die Zusage bleibt: Ein Eintrag lässt sich inhaltlich nie ändern und nie
-- einzeln entfernen. Erlaubt sind genau zwei Ausnahmen — den Urheber
-- anonymisieren, wenn sonst kein Feld abweicht, und mitgelöscht werden, wenn
-- die Sendung selbst schon fort ist.
create or replace function public.block_tracking_event_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
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

  if not exists (select 1 from public.shipments s where s.id = old.shipment_id) then
    return old;
  end if;

  raise exception
    'Ein Tracking-Event darf nicht einzeln gelöscht werden. Lösche die Sendung, '
    'dann verschwindet ihre Historie mit ihr.'
    using errcode = '42501';
end;
$$;


-- -----------------------------------------------------------------------------
-- 2. Admin-Rolle vergeben
-- -----------------------------------------------------------------------------
-- Fehlt das Konto noch, wird das nur gemeldet — Abschnitt 1 bleibt trotzdem
-- gespeichert. Konto im Dashboard anlegen und dieses Skript erneut ausführen.
do $$
declare
  v_email   text := (select email from mc_admin_email);
  v_user_id uuid;
  v_before  public.user_role;
  v_exists  boolean;
begin
  select u.id into v_user_id
    from auth.users u
   where lower(u.email) = lower(trim(v_email));

  if v_user_id is null then
    raise notice 'OFFEN  Es gibt noch kein Konto mit der Adresse %.', v_email;
    raise notice '       Dashboard → Authentication → Users → Add user →';
    raise notice '       Create new user, mit "Auto Confirm User" eingeschaltet.';
    raise notice '       Danach dieses Skript noch einmal ausführen.';
    return;
  end if;

  select true, p.role into v_exists, v_before
    from public.profiles p where p.id = v_user_id;

  if v_exists is null then
    insert into public.profiles (id, role, is_active)
    values (v_user_id, 'admin', true);
    raise notice 'OK  Profil neu angelegt und auf admin gesetzt (%).', v_email;
  else
    update public.profiles
       set role = 'admin', is_active = true, updated_at = now()
     where id = v_user_id;

    if v_before = 'admin' then
      raise notice 'OK  % war bereits Admin.', v_email;
    else
      raise notice 'OK  % von % auf admin hochgestuft.', v_email, v_before;
    end if;
  end if;
end $$;


-- -----------------------------------------------------------------------------
-- 3. Ergebnis
-- -----------------------------------------------------------------------------
select
  case when to_regprocedure('public.get_public_tracking(text)') is not null
       then 'ja' else 'NEIN' end                                as datenbank_bereit,
  (select count(*) from information_schema.tables
    where table_schema = 'public')::text                        as tabellen,
  coalesce(
    (select string_agg(u.email, ', ' order by u.email)
       from public.profiles p join auth.users u on u.id = p.id
      where p.role = 'admin'),
    '— noch keiner, siehe Meldung oben —')                      as admins;

drop table if exists mc_admin_email;
