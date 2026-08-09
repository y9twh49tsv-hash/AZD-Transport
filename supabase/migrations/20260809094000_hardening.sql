-- =============================================================================
-- Hardening: protect `is_active` the same way `role` is protected
-- =============================================================================
-- The "update own profile" policy lets people fix their own name and phone
-- number. Without this guard it would also let a *deactivated* account set
-- is_active back to true and walk straight back in — the RLS policy only
-- checks `id = auth.uid()`, which a deactivated user still satisfies.
--
-- Both privileged columns are now handled by one trigger function.
-- =============================================================================

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_role public.user_role;
  v_actor_active boolean;
begin
  -- Nothing privileged changed: allow.
  if new.role is not distinct from old.role
     and new.is_active is not distinct from old.is_active then
    return new;
  end if;

  -- Service role / SQL editor: no auth.uid(), full control.
  if auth.uid() is null then
    return new;
  end if;

  select p.role, p.is_active
    into v_actor_role, v_actor_active
    from public.profiles p
   where p.id = auth.uid();

  if v_actor_role is distinct from 'admin' or not coalesce(v_actor_active, false) then
    raise exception 'Nur aktive Admins dürfen Rolle oder Aktivierung ändern.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- The trigger itself already exists (created in the initial migration) and
-- points at this function, so replacing the function is enough.


-- =============================================================================
-- Hardening: the scan token is always generated, never accepted from a caller
-- =============================================================================
-- The first version fell back to a supplied value when it was non-empty. The
-- application never sends one, but a guessable token would make the QR code on
-- a label readable by anyone, so the value is now overwritten unconditionally.
-- =============================================================================

create or replace function public.assign_tracking_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.tracking_number := public.next_tracking_number();
    new.scan_token := public.generate_token(40);
    return new;
  end if;

  if new.tracking_number is distinct from old.tracking_number then
    raise exception 'Die Sendungsnummer kann nicht geändert werden.' using errcode = '42501';
  end if;
  if new.scan_token is distinct from old.scan_token then
    raise exception 'Der Scan-Token kann nicht geändert werden.' using errcode = '42501';
  end if;
  return new;
end;
$$;
