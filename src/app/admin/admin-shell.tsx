'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Building2,
  CalendarClock,
  Euro,
  LayoutDashboard,
  Menu,
  Package,
  Route as RouteIcon,
  Search,
  Settings,
  Sofa,
  Truck,
  Users,
  UsersRound,
  X,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignOutButton } from '@/components/layout/sign-out-button';
import { cn, normaliseTrackingNumber } from '@/lib/utils';
import { roleLabels } from '@/lib/shipment-status';
import type { UserRole } from '@/lib/supabase/database.types';

const nav = [
  { href: '/admin', label: 'Übersicht', icon: LayoutDashboard, exact: true },
  { href: '/admin/sendungen', label: 'Sendungen', icon: Package },
  { href: '/admin/abholungen', label: 'Abholungen', icon: CalendarClock },
  { href: '/admin/touren', label: 'Touren', icon: RouteIcon },
  { href: '/admin/sperrgut', label: 'Sperrgut-Anfragen', icon: Sofa },
  { href: '/admin/fahrzeuge', label: 'Fahrzeuge', icon: Truck },
  { href: '/admin/kunden', label: 'Kunden', icon: Users },
  { href: '/admin/finanzen', label: 'Finanzen', icon: Euro },
  { href: '/admin/team', label: 'Mitarbeiter', icon: UsersRound, adminOnly: true },
  { href: '/admin/einstellungen', label: 'Einstellungen', icon: Settings, adminOnly: true },
];

export function AdminShell({
  role,
  name,
  children,
}: {
  role: UserRole;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const links = nav.filter((item) => !item.adminOnly || role === 'admin');

  /**
   * One search box for everything: a tracking number jumps straight to the
   * shipment, anything else becomes a filtered list query.
   */
  function search(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;

    const normalised = normaliseTrackingNumber(term);
    if (/^[A-Z]{2,5}-\d{6}-\d{4,}$/.test(normalised)) {
      router.push(`/admin/sendungen?q=${encodeURIComponent(normalised)}`);
    } else {
      router.push(`/admin/sendungen?q=${encodeURIComponent(term)}`);
    }
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Verwaltung">
      {links.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary-muted text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto space-y-2 border-t border-border p-2 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Building2 className="size-4" aria-hidden />
          Zur Website
        </Link>
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
          <SignOutButton variant="ghost" size="sm" />
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin">
            <Logo compact />
          </Link>
        </div>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-lg sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-2 inline-flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-secondary lg:hidden"
            aria-label="Menü öffnen"
          >
            <Menu className="size-5" />
          </button>

          <form onSubmit={search} className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sendungsnummer, Name oder Telefon …"
              aria-label="Globale Suche"
              className="min-h-10 pl-10 text-sm"
            />
          </form>

          <Link href="/admin/sendungen" className="hidden sm:block">
            <Button size="sm" variant="outline">
              <Package aria-hidden />
              Sendungen
            </Button>
          </Link>
        </header>

        <main id="main" className="min-w-0 flex-1 bg-secondary/25 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Menü schließen"
          />
          {/* Any click inside closes the drawer — simpler and cheaper than an
              effect that watches the pathname and calls setState. */}
          <div
            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-lift"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-secondary"
                aria-label="Menü schließen"
              >
                <X className="size-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
