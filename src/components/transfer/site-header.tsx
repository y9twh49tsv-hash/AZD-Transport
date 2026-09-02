'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Phone, X } from 'lucide-react';
import { siteConfig, telLink } from '@/config/site';
import { content, pagePath, type Locale } from '@/content';
import { cn } from '@/lib/utils';
import { LanguageSwitch } from './language-switch';

/**
 * Die Navigation zeigt auf Abschnitte einer Seite, nicht auf sieben dünne
 * Unterseiten. Wer ein Fahrzeug überführen lassen will, liest einmal durch und
 * fragt an — jeder Seitenwechsel ist eine Gelegenheit, das nicht zu tun.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const t = content(locale);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const home = pagePath('home', locale);
  const request = pagePath('request', locale);

  const nav = [
    { href: `${home === '/' ? '' : home}/#leistungen`, label: t.nav.services },
    { href: `${home === '/' ? '' : home}/#premium`, label: t.nav.premium },
    { href: `${home === '/' ? '' : home}/#unternehmen`, label: t.nav.business },
    { href: `${home === '/' ? '' : home}/#ablauf`, label: t.nav.process },
    { href: `${home === '/' ? '' : home}/#faq`, label: t.nav.faq },
    { href: `${home === '/' ? '' : home}/#kontakt`, label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ein offenes Menü darf die Seite darunter nicht scrollen lassen — sonst
  // steht man nach dem Schließen an einer anderen Stelle als vorher.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled || open
          ? 'border-b border-border bg-background/85 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <div className="container flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href={home}
          className="flex min-h-11 flex-col justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          onClick={() => setOpen(false)}
        >
          <span className="block text-[0.95rem] font-semibold uppercase tracking-[0.22em] text-foreground">
            AZD
          </span>
          <span className="mt-0.5 block text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Transport
          </span>
        </Link>

        <nav aria-label={t.nav.mainNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch
            locale={locale}
            className="hidden min-h-11 items-center rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:inline-flex"
          />

          <a
            href={telLink()}
            className="hidden min-h-11 items-center gap-2 rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:text-foreground xl:inline-flex"
          >
            <Phone className="size-4" aria-hidden />
            {siteConfig.phone}
          </a>

          <Link
            href={request}
            className="hidden min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t.nav.request}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex size-11 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
          <nav aria-label={t.nav.mobileNavigation} className="container py-4">
            <ul className="divide-y divide-border">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[3.25rem] items-center text-base text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <LanguageSwitch
                  locale={locale}
                  className="flex min-h-[3.25rem] items-center text-base text-muted-foreground"
                />
              </li>
            </ul>

            <div className="mt-5 grid gap-2.5">
              <Link
                href={request}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                {t.nav.request}
              </Link>
              <a
                href={telLink()}
                className="flex min-h-12 items-center justify-center gap-2 rounded-sm border border-border px-5 text-sm font-medium text-foreground"
              >
                <Phone className="size-4" aria-hidden />
                {siteConfig.phone}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
