import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Package,
  PackageCheck,
  PackageOpen,
  Plane,
  Ship,
  Truck,
  Warehouse,
} from 'lucide-react';

export const SHIPMENT_STATUSES = [
  'BOOKED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'AT_GERMANY_HUB',
  'LOADED',
  'DEPARTED_GERMANY',
  'IN_TRANSIT',
  'ARRIVED_MOROCCO',
  'AT_MOROCCO_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
  'CANCELLED',
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

/** Statuses that end the lifecycle — no further transitions allowed. */
export const TERMINAL_STATUSES: ShipmentStatus[] = ['DELIVERED', 'CANCELLED'];

/** The normal happy path, in order. Used for the progress bar in tracking. */
export const HAPPY_PATH: ShipmentStatus[] = [
  'BOOKED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'AT_GERMANY_HUB',
  'LOADED',
  'DEPARTED_GERMANY',
  'IN_TRANSIT',
  'ARRIVED_MOROCCO',
  'AT_MOROCCO_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

type StatusMeta = {
  label: string;
  /** Customer-facing sentence used in tracking and notifications */
  publicMessage: string;
  icon: LucideIcon;
  /** Tailwind classes for the badge */
  tone: string;
  dot: string;
};

export const statusMeta: Record<ShipmentStatus, StatusMeta> = {
  BOOKED: {
    label: 'Gebucht',
    publicMessage: 'Deine Sendung wurde gebucht und ist bei uns registriert.',
    icon: Package,
    tone: 'bg-secondary text-secondary-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  PICKUP_SCHEDULED: {
    label: 'Abholung geplant',
    publicMessage: 'Die Abholung deiner Sendung ist eingeplant.',
    icon: CalendarClock,
    tone: 'bg-sand/15 text-sand-foreground border-sand/30',
    dot: 'bg-sand',
  },
  PICKED_UP: {
    label: 'Abgeholt',
    publicMessage: 'Deine Sendung wurde abgeholt.',
    icon: PackageCheck,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  AT_GERMANY_HUB: {
    label: 'Im Depot Deutschland',
    publicMessage: 'Deine Sendung ist in unserem Depot in Deutschland eingetroffen.',
    icon: Warehouse,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  LOADED: {
    label: 'Verladen',
    publicMessage: 'Deine Sendung wurde für den Transport nach Marokko verladen.',
    icon: PackageOpen,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  DEPARTED_GERMANY: {
    label: 'Deutschland verlassen',
    publicMessage: 'Deine Sendung ist unterwegs nach Marokko.',
    icon: Truck,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  IN_TRANSIT: {
    label: 'Unterwegs',
    publicMessage: 'Deine Sendung befindet sich auf dem Transportweg.',
    icon: Ship,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  ARRIVED_MOROCCO: {
    label: 'In Marokko angekommen',
    publicMessage: 'Deine Sendung ist in Marokko angekommen.',
    icon: Plane,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  AT_MOROCCO_HUB: {
    label: 'Im Depot Marokko',
    publicMessage: 'Deine Sendung ist in unserem Depot in Marokko eingetroffen.',
    icon: Warehouse,
    tone: 'bg-primary-muted text-primary border-primary/20',
    dot: 'bg-primary',
  },
  OUT_FOR_DELIVERY: {
    label: 'In Zustellung',
    publicMessage: 'Deine Sendung ist in Zustellung.',
    icon: Truck,
    tone: 'bg-accent/15 text-accent border-accent/30',
    dot: 'bg-accent',
  },
  DELIVERED: {
    label: 'Zugestellt',
    publicMessage: 'Deine Sendung wurde zugestellt.',
    icon: CheckCircle2,
    tone: 'bg-primary text-primary-foreground border-primary',
    dot: 'bg-primary',
  },
  EXCEPTION: {
    label: 'Problem / Rückfrage',
    publicMessage: 'Bei deiner Sendung gibt es eine Rückfrage. Wir melden uns bei dir.',
    icon: AlertTriangle,
    tone: 'bg-destructive/10 text-destructive border-destructive/25',
    dot: 'bg-destructive',
  },
  CANCELLED: {
    label: 'Storniert',
    publicMessage: 'Diese Sendung wurde storniert.',
    icon: Ban,
    tone: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
};

export function statusLabel(status: string): string {
  return statusMeta[status as ShipmentStatus]?.label ?? status;
}

/**
 * Whether a stored `public_message` is just the standard sentence for its
 * status, rather than something a member of staff typed.
 *
 * Tracking events keep the message that was written when the status changed, so
 * an event from last month carries German text no matter which language the
 * customer reads today. The standard sentences can be replaced by the
 * translated ones; a hand-written note cannot — translating it would mean
 * inventing words nobody wrote. So the two cases are told apart here.
 */
export function isDefaultPublicMessage(status: ShipmentStatus, message: string | null): boolean {
  if (!message) return true;
  return message.trim() === statusMeta[status]?.publicMessage;
}

export function isShipmentStatus(value: unknown): value is ShipmentStatus {
  return typeof value === 'string' && (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

/**
 * Allowed status transitions.
 *
 * The chain may be advanced step by step, but operators can also skip forward
 * (a shipment handed in at the depot never gets a "picked up" scan). What is
 * NOT allowed: moving backwards through the happy path, or leaving a terminal
 * status. EXCEPTION can be reached from anywhere and resolved back to any
 * non-terminal stage.
 */
export function allowedTransitions(current: ShipmentStatus): ShipmentStatus[] {
  if (TERMINAL_STATUSES.includes(current)) return [];

  if (current === 'EXCEPTION') {
    return [...HAPPY_PATH, 'CANCELLED'];
  }

  const index = HAPPY_PATH.indexOf(current);
  const forward = index === -1 ? [...HAPPY_PATH] : HAPPY_PATH.slice(index + 1);
  return [...forward, 'EXCEPTION', 'CANCELLED'];
}

export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  if (from === to) return false;
  return allowedTransitions(from).includes(to);
}

/** 0–100, used for the tracking progress bar. */
export function statusProgress(status: ShipmentStatus): number {
  if (status === 'CANCELLED') return 0;
  if (status === 'EXCEPTION') return 50;
  const index = HAPPY_PATH.indexOf(status);
  if (index === -1) return 0;
  return Math.round((index / (HAPPY_PATH.length - 1)) * 100);
}

/** Which side of the corridor the shipment is currently on. */
export function statusPhase(status: ShipmentStatus): 'origin' | 'transit' | 'destination' | 'done' {
  if (status === 'DELIVERED' || status === 'CANCELLED') return 'done';
  if (['BOOKED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'AT_GERMANY_HUB', 'LOADED'].includes(status)) {
    return 'origin';
  }
  if (['ARRIVED_MOROCCO', 'AT_MOROCCO_HUB', 'OUT_FOR_DELIVERY'].includes(status)) {
    return 'destination';
  }
  return 'transit';
}

// --- Trips -----------------------------------------------------------------

export const TRIP_STATUSES = [
  'PLANNED',
  'LOADING',
  'DEPARTED',
  'IN_TRANSIT',
  'ARRIVED',
  'COMPLETED',
] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export const tripStatusLabels: Record<TripStatus, string> = {
  PLANNED: 'Geplant',
  LOADING: 'Wird beladen',
  DEPARTED: 'Abgefahren',
  IN_TRANSIT: 'Unterwegs',
  ARRIVED: 'Angekommen',
  COMPLETED: 'Abgeschlossen',
};

// --- Payments --------------------------------------------------------------

export const PAYMENT_STATUSES = ['unpaid', 'paid_cash', 'paid_online', 'invoiced'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Unbezahlt',
  paid_cash: 'Bar bezahlt',
  paid_online: 'Online bezahlt',
  invoiced: 'Rechnung',
};

export const paymentStatusTone: Record<PaymentStatus, string> = {
  unpaid: 'bg-destructive/10 text-destructive border-destructive/25',
  paid_cash: 'bg-primary-muted text-primary border-primary/20',
  paid_online: 'bg-primary-muted text-primary border-primary/20',
  invoiced: 'bg-sand/15 text-sand-foreground border-sand/30',
};

// --- Bulky requests --------------------------------------------------------

export const BULKY_STATUSES = ['NEW', 'IN_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED'] as const;
export type BulkyStatus = (typeof BULKY_STATUSES)[number];

export const bulkyStatusLabels: Record<BulkyStatus, string> = {
  NEW: 'Neu',
  IN_REVIEW: 'In Prüfung',
  QUOTED: 'Angebot erstellt',
  ACCEPTED: 'Akzeptiert',
  REJECTED: 'Abgelehnt',
};

export const bulkyStatusTone: Record<BulkyStatus, string> = {
  NEW: 'bg-accent/15 text-accent border-accent/30',
  IN_REVIEW: 'bg-sand/15 text-sand-foreground border-sand/30',
  QUOTED: 'bg-primary-muted text-primary border-primary/20',
  ACCEPTED: 'bg-primary text-primary-foreground border-primary',
  REJECTED: 'bg-muted text-muted-foreground border-border',
};

// --- Vehicles --------------------------------------------------------------

export const VEHICLE_STATUSES = ['available', 'on_trip', 'maintenance'] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  available: 'Verfügbar',
  on_trip: 'Auf Tour',
  maintenance: 'In Wartung',
};

// --- Roles -----------------------------------------------------------------

export const USER_ROLES = ['customer', 'driver', 'staff', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const roleLabels: Record<UserRole, string> = {
  customer: 'Kunde',
  driver: 'Fahrer',
  staff: 'Mitarbeiter',
  admin: 'Admin',
};
