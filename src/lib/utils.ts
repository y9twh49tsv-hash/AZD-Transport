import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Europe/Berlin',
});

const longDateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Berlin',
});

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return `${dateTimeFormatter.format(date)} Uhr`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export function formatLongDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return longDateFormatter.format(date);
}

/** "vor 3 Stunden" — used in timelines where the exact minute does not matter. */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (Math.abs(minutes) < 1) return 'gerade eben';
  if (Math.abs(minutes) < 60) return `vor ${minutes} Min.`;

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `vor ${hours} Std.`;

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;

  return formatDate(date);
}

/** ISO date string for <input type="date"> defaults, in Europe/Berlin. */
export function todayIso(offsetDays = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  return now.toISOString().slice(0, 10);
}

export function initials(firstName?: string | null, lastName?: string | null): string {
  const a = firstName?.trim()?.[0] ?? '';
  const b = lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

/** Normalises a tracking number typed by a human: "mc 260809 0042" works too. */
export function normaliseTrackingNumber(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
  if (/^[A-Z]{2,5}-\d{6}-\d{4,}$/.test(cleaned)) return cleaned;

  // Accept the number without separators as well.
  const compact = cleaned.replace(/[^A-Z0-9]/g, '');
  const match = compact.match(/^([A-Z]{2,5})(\d{6})(\d{4,})$/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  return cleaned;
}

export function pluralise(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/**
 * Makes a user-typed search term safe to embed in a PostgREST `or()` filter.
 *
 * That grammar separates conditions with commas and groups them with
 * parentheses, so a term containing `,` `(` `)` or `\` could otherwise change
 * the meaning of the query — e.g. turning a name search into an extra `or`
 * condition that matches rows the search was never meant to reach.
 *
 * Everything dangerous is replaced with a space rather than removed, so
 * "Meier,Schmidt" degrades to a harmless "Meier Schmidt" instead of silently
 * becoming a different word.
 */
export function escapeFilterValue(value: string): string {
  return value
    .replace(/[,()\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
