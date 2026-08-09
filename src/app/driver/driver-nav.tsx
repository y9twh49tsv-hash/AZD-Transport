'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, QrCode, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/driver', label: 'Heute', icon: Home, exact: true },
  { href: '/driver/scan', label: 'Scannen', icon: QrCode },
  { href: '/driver/suche', label: 'Suchen', icon: Search },
  { href: '/konto', label: 'Konto', icon: User },
];

/**
 * Bottom navigation — thumb-reachable, 4 large targets, safe-area aware.
 */
export function DriverNav({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Fahrer-Navigation"
    >
      <p className="sr-only">Angemeldet als {name}</p>
      <ul className="mx-auto flex max-w-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('size-6', active && 'stroke-[2.4]')} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
