-- =============================================================================
-- MaroCargo — Row Level Security
-- =============================================================================
-- Threat model
-- ------------
-- The anon key is public by definition (it ships in the browser bundle). These
-- policies decide what someone holding that key — or a logged-in customer's
-- session — can reach through PostgREST directly.
--
-- All privileged WRITES in the application go through server-side code that
-- authenticates the user, checks the role in TypeScript and then uses the
-- service-role key. RLS is the second lock on the same door: even if an
-- application-level check were missed, a customer session still cannot read or
-- write another customer's data.
--
-- Default posture: every table denies everything, then we open the minimum.
-- =============================================================================

alter table public.app_settings         enable row level security;
alter table public.profiles             enable row level security;
alter table public.customers            enable row level security;
alter table public.shipments            enable row level security;
alter table public.shipment_items       enable row level security;
alter table public.tracking_events      enable row level security;
alter table public.security_seals       enable row level security;
alter table public.trips                enable row level security;
alter table public.trip_shipments       enable row level security;
alter table public.vehicles             enable row level security;
alter table public.payments             enable row level security;
alter table public.pickup_assignments   enable row level security;
alter table public.bulky_item_requests  enable row level security;
alter table public.attachments          enable row level security;
alter table public.notification_logs    enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.tracking_counters    enable row level security;

-- Counters are only ever touched by SECURITY DEFINER functions: no policies at
-- all means no direct access for anon or authenticated.

-- -----------------------------------------------------------------------------
-- Visibility helper
-- -----------------------------------------------------------------------------

create or replace function public.can_view_shipment(p_shipment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.shipments s
     where s.id = p_shipment_id
       and (
            public.is_staff()
         or s.created_by = auth.uid()
         or s.customer_id in (
              select c.id from public.customers c where c.profile_id = auth.uid()
            )
         or (
              public.is_driver()
              and (
                   s.assigned_driver_id = auth.uid()
                or exists (
                     select 1 from public.pickup_assignments pa
                      where pa.shipment_id = s.id and pa.driver_id = auth.uid()
                   )
                or exists (
                     select 1
                       from public.trip_shipments ts
                       join public.trips t on t.id = ts.trip_id
                      where ts.shipment_id = s.id and t.driver_id = auth.uid()
                   )
              )
            )
       )
  );
$$;

-- -----------------------------------------------------------------------------
-- app_settings
-- -----------------------------------------------------------------------------

create policy "settings readable by staff"
  on public.app_settings for select to authenticated
  using (public.is_staff());

create policy "settings writable by admins"
  on public.app_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

create policy "read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "staff read all profiles"
  on public.profiles for select to authenticated
  using (public.is_staff());

-- Users may edit their own name/phone. The role column is additionally guarded
-- by the profiles_guard_role trigger, which rejects self-promotion.
create policy "update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "admins manage profiles"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------

create policy "staff manage customers"
  on public.customers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "read own customer record"
  on public.customers for select to authenticated
  using (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- shipments
-- -----------------------------------------------------------------------------

create policy "view permitted shipments"
  on public.shipments for select to authenticated
  using (public.can_view_shipment(id));

create policy "staff manage shipments"
  on public.shipments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Deliberately absent: any INSERT policy for customers. Bookings are created
-- server-side so that price, tracking number and status cannot be forged.

-- -----------------------------------------------------------------------------
-- shipment_items
-- -----------------------------------------------------------------------------

create policy "view items of permitted shipments"
  on public.shipment_items for select to authenticated
  using (public.can_view_shipment(shipment_id));

create policy "staff manage items"
  on public.shipment_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- tracking_events
--
-- No UPDATE or DELETE policy exists for anybody, and the
-- tracking_events_immutable trigger blocks it even for the service role.
-- -----------------------------------------------------------------------------

create policy "view events of permitted shipments"
  on public.tracking_events for select to authenticated
  using (public.can_view_shipment(shipment_id));

create policy "staff and drivers add events"
  on public.tracking_events for insert to authenticated
  with check (
    (public.is_staff() or public.is_driver())
    and public.can_view_shipment(shipment_id)
  );

-- -----------------------------------------------------------------------------
-- security_seals
-- -----------------------------------------------------------------------------

create policy "view seals of permitted shipments"
  on public.security_seals for select to authenticated
  using (public.can_view_shipment(shipment_id));

create policy "staff manage seals"
  on public.security_seals for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers add seals"
  on public.security_seals for insert to authenticated
  with check (public.is_driver() and public.can_view_shipment(shipment_id));

-- -----------------------------------------------------------------------------
-- trips, trip_shipments, vehicles — internal operations data
-- -----------------------------------------------------------------------------

create policy "staff manage trips"
  on public.trips for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read own trips"
  on public.trips for select to authenticated
  using (public.is_driver() and driver_id = auth.uid());

create policy "staff manage trip shipments"
  on public.trip_shipments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read own trip shipments"
  on public.trip_shipments for select to authenticated
  using (
    public.is_driver()
    and exists (select 1 from public.trips t where t.id = trip_id and t.driver_id = auth.uid())
  );

create policy "staff manage vehicles"
  on public.vehicles for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read vehicles"
  on public.vehicles for select to authenticated
  using (public.is_driver());

-- -----------------------------------------------------------------------------
-- pickup_assignments
-- -----------------------------------------------------------------------------

create policy "staff manage pickups"
  on public.pickup_assignments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "drivers read own pickups"
  on public.pickup_assignments for select to authenticated
  using (public.is_driver() and driver_id = auth.uid());

create policy "drivers update own pickups"
  on public.pickup_assignments for update to authenticated
  using (public.is_driver() and driver_id = auth.uid())
  with check (public.is_driver() and driver_id = auth.uid());

create policy "customers read own pickups"
  on public.pickup_assignments for select to authenticated
  using (public.can_view_shipment(shipment_id));

-- -----------------------------------------------------------------------------
-- payments — money is back-office only, never readable by customers directly
-- -----------------------------------------------------------------------------

create policy "staff manage payments"
  on public.payments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- bulky_item_requests
--
-- Public submissions and the token-based offer page are handled server-side,
-- so anon needs no direct access here at all.
-- -----------------------------------------------------------------------------

create policy "staff manage bulky requests"
  on public.bulky_item_requests for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- attachments — metadata only; the files live in private Storage buckets
-- -----------------------------------------------------------------------------

create policy "staff manage attachments"
  on public.attachments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "view attachments of permitted shipments"
  on public.attachments for select to authenticated
  using (shipment_id is not null and public.can_view_shipment(shipment_id));

create policy "drivers add attachments"
  on public.attachments for insert to authenticated
  with check (
    public.is_driver()
    and shipment_id is not null
    and public.can_view_shipment(shipment_id)
  );

-- -----------------------------------------------------------------------------
-- notification_logs & audit_logs — admin-only, contain personal data
-- -----------------------------------------------------------------------------

create policy "admins read notification logs"
  on public.notification_logs for select to authenticated
  using (public.is_admin());

create policy "admins read audit logs"
  on public.audit_logs for select to authenticated
  using (public.is_admin());

-- Audit rows are written by SECURITY DEFINER triggers and the server. Nobody
-- gets UPDATE or DELETE — not even admins — so the trail cannot be rewritten.
