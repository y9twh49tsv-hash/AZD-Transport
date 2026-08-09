import { brand } from '@/config/brand';
import { cn } from '@/lib/utils';

/**
 * Wordmark + mark. The mark is an abstract corridor: two anchor points
 * (Germany, Morocco) joined by an arc, wrapped in a parcel silhouette.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn('size-8', className)}
      aria-hidden="true"
      role="presentation"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M8 12.2 16 8l8 4.2v7.6L16 24l-8-4.2v-7.6Z"
        className="stroke-primary-foreground"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 12.2 16 16.4l8-4.2M16 16.4V24" className="stroke-primary-foreground" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="16" cy="16.4" r="1.7" className="fill-[hsl(var(--sand))]" />
    </svg>
  );
}

export function Logo({
  className,
  showName = true,
  compact = false,
}: {
  className?: string;
  showName?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={compact ? 'size-7' : 'size-8'} />
      {showName && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.0625rem] font-bold tracking-tight text-foreground">
            {brand.name}
          </span>
          {!compact && (
            <span className="mt-0.5 text-[0.6875rem] font-medium tracking-wide text-muted-foreground">
              🇩🇪 &nbsp;↔&nbsp; 🇲🇦
            </span>
          )}
        </span>
      )}
    </span>
  );
}
