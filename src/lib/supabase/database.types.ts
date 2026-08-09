/**
 * Typed description of the Supabase schema.
 *
 * Kept in sync by hand with `supabase/migrations/*.sql`. If you have the
 * Supabase CLI installed you can regenerate it instead:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public \
 *     > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = 'customer' | 'driver' | 'staff' | 'admin';
export type CountryCode = 'DE' | 'MA';
export type ShipmentType = 'standard' | 'bulky';
export type ShipmentStatus =
  | 'BOOKED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'AT_GERMANY_HUB'
  | 'LOADED'
  | 'DEPARTED_GERMANY'
  | 'IN_TRANSIT'
  | 'ARRIVED_MOROCCO'
  | 'AT_MOROCCO_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION'
  | 'CANCELLED';
export type PaymentStatus = 'unpaid' | 'paid_cash' | 'paid_online' | 'invoiced';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'online' | 'other';
export type TripStatus = 'PLANNED' | 'LOADING' | 'DEPARTED' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED';
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance';
export type BulkyStatus = 'NEW' | 'IN_REVIEW' | 'QUOTED' | 'ACCEPTED' | 'REJECTED';
export type PickupStatus = 'scheduled' | 'en_route' | 'completed' | 'failed' | 'cancelled';
export type AttachmentKind =
  | 'bulky_photo'
  | 'pickup_photo'
  | 'delivery_photo'
  | 'signature'
  | 'seal_photo'
  | 'document'
  | 'other';
export type NotificationChannel = 'email' | 'whatsapp' | 'sms';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'skipped';

/** Columns filled in by the database on insert. */
type Auto = 'id' | 'created_at' | 'updated_at';

type Insertable<Row, Extra extends keyof Row = never> = Omit<Row, (Auto & keyof Row) | Extra> &
  Partial<Pick<Row, Extract<Auto | Extra, keyof Row>>>;

type Table<Row, Extra extends keyof Row = never> = {
  Row: Row;
  Insert: Insertable<Row, Extra>;
  Update: Partial<Row>;
  Relationships: [];
};

// -- Row shapes --------------------------------------------------------------

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AppSettingsRow = {
  id: boolean;
  brand_name: string;
  tracking_prefix: string;
  price_per_kg_cents: number;
  minimum_price_cents: number;
  pickup_fee_cents: number;
  created_at: string;
  updated_at: string;
};

export type CustomerRow = {
  id: string;
  profile_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  address_line1: string | null;
  postal_code: string | null;
  city: string | null;
  country: CountryCode | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ShipmentRow = {
  id: string;
  tracking_number: string;
  scan_token: string;
  shipment_type: ShipmentType;
  status: ShipmentStatus;
  customer_id: string | null;
  created_by: string | null;

  sender_first_name: string;
  sender_last_name: string;
  sender_phone: string;
  sender_email: string | null;
  sender_address: string;
  sender_postal_code: string | null;
  sender_city: string;
  sender_country: CountryCode;

  recipient_first_name: string;
  recipient_last_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_country: CountryCode;

  origin_country: CountryCode;
  origin_city: string;
  destination_country: CountryCode;
  destination_city: string;

  weight_kg: number;
  piece_count: number;
  content_type: string | null;
  description: string | null;

  pickup_requested: boolean;
  pickup_date: string | null;

  price_base_cents: number;
  pickup_fee_cents: number;
  price_total_cents: number;
  currency: string;
  payment_status: PaymentStatus;
  paid_at: string | null;

  assigned_driver_id: string | null;
  internal_notes: string | null;
  terms_accepted_at: string | null;
  prohibited_confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;

  created_at: string;
  updated_at: string;
};

export type ShipmentItemRow = {
  id: string;
  shipment_id: string;
  label: string;
  quantity: number;
  weight_kg: number | null;
  description: string | null;
  created_at: string;
};

export type TrackingEventRow = {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  occurred_at: string;
  location: string | null;
  created_by: string | null;
  public_message: string | null;
  internal_note: string | null;
  created_at: string;
};

export type SecuritySealRow = {
  id: string;
  shipment_id: string;
  seal_number: string;
  sealed_at: string;
  sealed_by: string | null;
  photo_path: string | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
};

export type VehicleRow = {
  id: string;
  plate: string;
  make: string | null;
  model: string | null;
  gross_weight_kg: number | null;
  payload_kg: number;
  cargo_volume_m3: number | null;
  status: VehicleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TripRow = {
  id: string;
  code: string;
  origin_country: CountryCode;
  origin_city: string;
  destination_country: CountryCode;
  destination_city: string;
  departure_date: string;
  planned_arrival_date: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  status: TripStatus;
  max_payload_kg: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TripShipmentRow = {
  trip_id: string;
  shipment_id: string;
  added_at: string;
  added_by: string | null;
};

export type PickupAssignmentRow = {
  id: string;
  shipment_id: string;
  driver_id: string | null;
  scheduled_date: string;
  time_window_start: string | null;
  time_window_end: string | null;
  status: PickupStatus;
  completed_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  shipment_id: string;
  amount_cents: number;
  method: PaymentMethod;
  reference: string | null;
  received_by: string | null;
  received_at: string;
  note: string | null;
  created_at: string;
};

export type BulkyRequestRow = {
  id: string;
  reference: string;
  public_token: string;
  origin_country: CountryCode;
  origin_city: string;
  destination_country: CountryCode;
  destination_city: string;
  item_type: string;
  item_description: string | null;
  approx_weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  contact_first_name: string;
  contact_last_name: string;
  phone: string;
  email: string | null;
  pickup_requested: boolean;
  notes: string | null;
  status: BulkyStatus;
  quoted_price_cents: number | null;
  quote_note: string | null;
  quoted_at: string | null;
  quoted_by: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  shipment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AttachmentRow = {
  id: string;
  shipment_id: string | null;
  bulky_request_id: string | null;
  kind: AttachmentKind;
  bucket: string;
  path: string;
  mime_type: string | null;
  size_bytes: number | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type NotificationLogRow = {
  id: string;
  shipment_id: string | null;
  bulky_request_id: string | null;
  channel: NotificationChannel;
  template: string;
  recipient: string;
  subject: string | null;
  status: NotificationStatus;
  provider: string | null;
  provider_message_id: string | null;
  error: string | null;
  created_at: string;
};

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  actor_label: string | null;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  metadata: Json | null;
  created_at: string;
};

export type TripCapacityRow = {
  trip_id: string;
  code: string;
  max_payload_kg: number | null;
  loaded_weight_kg: number;
  free_capacity_kg: number;
  shipment_count: number;
};

// -- Database ----------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      app_settings: Table<AppSettingsRow>;
      profiles: Table<ProfileRow, 'role' | 'is_active' | 'full_name' | 'phone'>;
      customers: Table<
        CustomerRow,
        'profile_id' | 'email' | 'address_line1' | 'postal_code' | 'city' | 'country' | 'notes'
      >;
      shipments: Table<
        ShipmentRow,
        | 'tracking_number'
        | 'scan_token'
        | 'shipment_type'
        | 'status'
        | 'customer_id'
        | 'created_by'
        | 'sender_email'
        | 'sender_postal_code'
        | 'content_type'
        | 'description'
        | 'pickup_requested'
        | 'pickup_date'
        | 'price_base_cents'
        | 'pickup_fee_cents'
        | 'price_total_cents'
        | 'currency'
        | 'payment_status'
        | 'paid_at'
        | 'assigned_driver_id'
        | 'internal_notes'
        | 'terms_accepted_at'
        | 'prohibited_confirmed_at'
        | 'delivered_at'
        | 'cancelled_at'
        | 'piece_count'
      >;
      shipment_items: Table<ShipmentItemRow, 'quantity' | 'weight_kg' | 'description'>;
      tracking_events: Table<
        TrackingEventRow,
        'occurred_at' | 'location' | 'created_by' | 'public_message' | 'internal_note'
      >;
      security_seals: Table<
        SecuritySealRow,
        'sealed_at' | 'sealed_by' | 'photo_path' | 'note' | 'is_active'
      >;
      vehicles: Table<
        VehicleRow,
        'make' | 'model' | 'gross_weight_kg' | 'cargo_volume_m3' | 'status' | 'notes'
      >;
      trips: Table<
        TripRow,
        | 'planned_arrival_date'
        | 'vehicle_id'
        | 'driver_id'
        | 'status'
        | 'max_payload_kg'
        | 'notes'
      >;
      trip_shipments: Table<TripShipmentRow, 'added_at' | 'added_by'>;
      pickup_assignments: Table<
        PickupAssignmentRow,
        | 'driver_id'
        | 'time_window_start'
        | 'time_window_end'
        | 'status'
        | 'completed_at'
        | 'note'
      >;
      payments: Table<
        PaymentRow,
        'method' | 'reference' | 'received_by' | 'received_at' | 'note'
      >;
      bulky_item_requests: Table<
        BulkyRequestRow,
        | 'reference'
        | 'public_token'
        | 'item_description'
        | 'approx_weight_kg'
        | 'length_cm'
        | 'width_cm'
        | 'height_cm'
        | 'email'
        | 'pickup_requested'
        | 'notes'
        | 'status'
        | 'quoted_price_cents'
        | 'quote_note'
        | 'quoted_at'
        | 'quoted_by'
        | 'accepted_at'
        | 'rejected_at'
        | 'shipment_id'
      >;
      attachments: Table<
        AttachmentRow,
        | 'shipment_id'
        | 'bulky_request_id'
        | 'kind'
        | 'mime_type'
        | 'size_bytes'
        | 'caption'
        | 'uploaded_by'
      >;
      notification_logs: Table<
        NotificationLogRow,
        | 'shipment_id'
        | 'bulky_request_id'
        | 'subject'
        | 'status'
        | 'provider'
        | 'provider_message_id'
        | 'error'
      >;
      audit_logs: Table<
        AuditLogRow,
        | 'actor_id'
        | 'actor_role'
        | 'actor_label'
        | 'entity_id'
        | 'entity_label'
        | 'field'
        | 'old_value'
        | 'new_value'
        | 'metadata'
      >;
    };
    Views: {
      trip_capacity: { Row: TripCapacityRow; Relationships: [] };
    };
    Functions: {
      get_public_tracking: { Args: { p_tracking_number: string }; Returns: Json };
      admin_dashboard_stats: { Args: Record<string, never>; Returns: Json };
      next_tracking_number: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      user_role: UserRole;
      country_code: CountryCode;
      shipment_type: ShipmentType;
      shipment_status: ShipmentStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      trip_status: TripStatus;
      vehicle_status: VehicleStatus;
      bulky_status: BulkyStatus;
      pickup_status: PickupStatus;
      attachment_kind: AttachmentKind;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
