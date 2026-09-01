'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Package, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';
import { LanguageSwitcher } from '@/components/layout/language-switcher';


export function SiteHeader({
  isSignedIn = false,
  dashboardHref = '/konto',
}: {
  isSignedIn?: boolean;
  dashboardHref?: string;
}) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Innerhalb der Komponente, nicht auf Modulebene: sonst würde die Liste einmal
  // beim Laden des Moduls ausgewertet und bliebe für immer in der Sprache, die
  // damals galt.
  const links = [
    { href: '/preisrechner', label: t('nav.calculator') },
    { href: '/buchen', label: t('nav.booking') },
    { href: '/tracking', label: t('nav.tracking') },
    { href: '/sperrgut', label: t('nav.bulky') },
    { href: '/kontakt', label: t('nav.contact') },
  ];

  // Prevent the page behind the open menu from scrolling on iOS.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/pakete" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
          <span className="sr-only">{t('nav.home')}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t('nav.mainNavigation')}>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-muted text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Link href={isSignedIn ? dashboardHref : '/login'}>
            <Button variant="ghost" size="sm">
              {isSignedIn ? t('nav.account') : t('nav.login')}
            </Button>
          </Link>
          <Link href="/buchen">
            <Button size="sm">
              <Package aria-hidden />
              {t('common.bookShipment')}
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-me-2 inline-flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-secondary lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t('common.close') : t('nav.menu')}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        // Closing happens on click rather than in an effect watching `pathname`:
        // navigating to the current route would not change the path, and an
        // effect that calls setState causes an extra render pass.
        <div
          id="mobile-nav"
          className="border-t border-border bg-background lg:hidden"
          onClick={() => setOpen(false)}
        >
          <nav className="container flex flex-col gap-1 py-4" aria-label={t('nav.mainNavigation')}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              {/* Auf dem Handy zuerst: wer die Seite nicht lesen kann, braucht
                  das hier vor allem anderen. */}
              <LanguageSwitcher className="w-full [&>select]:w-full" />
              <Link href={isSignedIn ? dashboardHref : '/login'}>
                <Button variant="outline" block>
                  {isSignedIn ? t('nav.account') : t('nav.login')}
                </Button>
              </Link>
              <Link href="/buchen">
                <Button block>
                  <Package aria-hidden />
                  {t('common.bookShipment')}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
