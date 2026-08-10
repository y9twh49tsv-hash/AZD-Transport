-- =============================================================================
-- MaroCargo — ein Konto zum Admin machen
-- =============================================================================
-- Im Supabase SQL Editor ausführen, NACHDEM das Konto angelegt wurde
-- (Dashboard → Authentication → Users → Add user → Create new user,
--  dabei "Auto Confirm User" einschalten).
--
-- Trage unten deine E-Mail-Adresse ein. Sonst ist nichts zu ändern.
--
-- Das Skript darf beliebig oft laufen. Es
--   · findet das Konto anhand der E-Mail-Adresse,
--   · legt das Profil an, falls es fehlt,
--   · setzt die Rolle auf admin und aktiviert das Konto,
--   · und sagt dir am Ende genau, was passiert ist.
--
-- Warum das Konto nicht auch per SQL angelegt wird: die Tabelle auth.users
-- gehört dem Anmeldedienst von Supabase, und deren Aufbau ändert sich mit
-- dessen Versionen. Ein von Hand eingefügter Datensatz sieht richtig aus, kann
-- aber je nach Version die Anmeldung blockieren — und der Fehler zeigt sich
-- erst beim Einloggen. Über das Dashboard angelegt, kann daran nichts falsch
-- laufen.
--
-- Noch einmal von vorn anfangen? Dann zuerst das Konto entfernen:
--
--     delete from auth.users where lower(email) = 'deine@adresse.de';
--
-- Das ist ungefährlich: Sendungen, Kunden, Fahrten und das Änderungsprotokoll
-- bleiben erhalten. Alle zwölf Verweise auf ein Profil sind auf SET NULL
-- gesetzt, der Datensatz verliert also nur seine Zuordnung zur Person und wird
-- nicht mitgelöscht. Anschließend das Konto im Dashboard neu anlegen und
-- dieses Skript ausführen.
-- =============================================================================

do $$
declare
  -- Adresse und Name des künftigen Admins. Nur zwischen den Anführungszeichen
  -- ändern — ans Ende des Skripts angehängt ergibt eine Adresse einen
  -- Syntaxfehler.
  v_email    text := 'mehdi90@outlook.de';
  v_name     text := 'Mehdi';

  v_user_id  uuid;
  v_before   public.user_role;
  v_existed  boolean;
begin
  select u.id into v_user_id
    from auth.users u
   where lower(u.email) = lower(trim(v_email));

  if v_user_id is null then
    raise exception E'Es gibt kein Konto mit der Adresse %.\n'
      'Lege es zuerst an: Dashboard → Authentication → Users → Add user → '
      'Create new user, mit eingeschaltetem "Auto Confirm User". '
      'Danach dieses Skript erneut ausführen.', v_email
      using errcode = 'no_data_found';
  end if;

  select true, p.role into v_existed, v_before
    from public.profiles p
   where p.id = v_user_id;

  -- Normalerweise legt der Trigger on_auth_user_created das Profil an. Fehlt es
  -- trotzdem — etwa weil das Konto vor der Einrichtung der Datenbank bestand —
  -- wird es hier nachgetragen, statt mit "0 Zeilen geändert" zu enden.
  if v_existed is null then
    insert into public.profiles (id, role, full_name, is_active)
    values (v_user_id, 'admin', nullif(trim(v_name), ''), true);

    raise notice 'OK  Profil neu angelegt und auf admin gesetzt (%).', v_email;
  else
    update public.profiles
       set role      = 'admin',
           is_active = true,
           full_name = coalesce(nullif(trim(v_name), ''), full_name),
           updated_at = now()
     where id = v_user_id;

    if v_before = 'admin' then
      raise notice 'OK  % war bereits Admin — nichts zu tun.', v_email;
    else
      raise notice 'OK  % von % auf admin hochgestuft.', v_email, v_before;
    end if;
  end if;
end $$;

-- Kontrolle: Hier muss genau eine Zeile mit der Rolle admin stehen.
select u.email,
       p.role,
       p.is_active                             as aktiv,
       (u.email_confirmed_at is not null)      as email_bestaetigt,
       p.full_name                             as name
  from public.profiles p
  join auth.users u on u.id = p.id
 where p.role = 'admin'
 order by u.email;
