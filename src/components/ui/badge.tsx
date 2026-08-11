import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  bulkyStatusLabels,
  bulkyStatusTone,
  paymentStatusLabels,
  paymentStatusTone,
  statusMeta,
  tripStatusLabels,
  type BulkyStatus,
  type PaymentStatus,
  type ShipmentStatus,
  type TripStatus,
} from '@/lib/shipment-status';

const base =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none';

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(base, 'border-border bg-secondary text-secondary-foreground', className)}
      {...props}
    />
  );
}

/**
 * `label` overrides the German default. The staff areas are German by design
 * and pass nothing; the public tracking page passes the translated label so a
 * French visitor does not get one German word in an otherwise French page.
 */
export function StatusBadge({
  status,
  label,
  withIcon = true,
  className,
}: {
  status: ShipmentStatus;
  label?: string;
  withIcon?: boolean;
  className?: string;
}) {
  const meta = statusMeta[status];
  if (!meta) return <Badge className={className}>{label ?? status}</Badge>;
  const Icon = meta.icon;

  return (
    <span className={cn(base, meta.tone, className)}>
      {withIcon && <Icon className="size-3.5" aria-hidden />}
      {label ?? meta.label}
    </span>
  );
}

export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, paymentStatusTone[status], className)}>
      {paymentStatusLabels[status]}
    </span>
  );
}

export function TripStatusBadge({ status, className }: { status: TripStatus; className?: string }) {
  const tone =
    status === 'COMPLETED'
      ? 'bg-primary text-primary-foreground border-primary'
      : status === 'PLANNED'
        ? 'bg-secondary text-secondary-foreground border-border'
        : 'bg-primary-muted text-primary border-primary/20';
  return <span className={cn(base, tone, className)}>{tripStatusLabels[status]}</span>;
}

export function BulkyStatusBadge({
  status,
  className,
}: {
  status: BulkyStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, bulkyStatusTone[status], className)}>
      {bulkyStatusLabels[status]}
    </span>
  );
}
