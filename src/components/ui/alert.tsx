import * as React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const tones = {
  info: {
    box: 'border-primary/20 bg-primary-muted/70 text-foreground',
    icon: 'text-primary',
    Icon: Info,
  },
  success: {
    box: 'border-primary/25 bg-primary-muted text-foreground',
    icon: 'text-primary',
    Icon: CheckCircle2,
  },
  warning: {
    box: 'border-sand/40 bg-sand/10 text-foreground',
    icon: 'text-sand-foreground',
    Icon: AlertTriangle,
  },
  error: {
    box: 'border-destructive/25 bg-destructive/10 text-foreground',
    icon: 'text-destructive',
    Icon: XCircle,
  },
} as const;

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  icon = true,
}: {
  tone?: keyof typeof tones;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  const config = tones[tone];
  const Icon = config.Icon;

  return (
    <div
      className={cn('flex gap-3 rounded-xl border p-4', config.box, className)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {icon && <Icon className={cn('mt-0.5 size-5 shrink-0', config.icon)} aria-hidden />}
      <div className="min-w-0 text-sm leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-1', 'text-muted-foreground')}>{children}</div>}
      </div>
    </div>
  );
}
