'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Phone, X } from 'lucide-react';
import { siteConfig, telLink } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Die Navigation zeigt auf Abschnitte einer Seite, nicht auf sieben dünne
 * Unterseiten. Wer ein Fahrzeug überführen lassen will, liest einmal durch und
 * fragt an — jeder Seitenwechsel ist eine Gelegenheit, das nicht zu tun.
 */
const NAV = [
  { href: '/#leistungen', label: 'Leistungen' },
  { href: '/#premium', label: 'Premium-Service' },
  { href: '/#unternehmen', label: 'Für Unternehmen' },
  { href: '/#ablauf', label: 'Ablauf' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#kontakt', label: 'Kontakt' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          href="/"
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

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
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
          <a
            href={telLink()}
            className="hidden min-h-11 items-center gap-2 rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <Phone className="size-4" aria-hidden />
            <span className="hidden xl:inline">{siteConfig.phone}</span>
            <span className="xl:hidden">Anrufen</span>
          </a>

          <Link
            href="/anfrage"
            className="hidden min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Überführung anfragen
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            className="inline-flex size-11 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Hauptnavigation mobil" className="container py-4">
            <ul className="divide-y divide-border">
              {NAV.map((item) => (
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
            </ul>

            <div className="mt-5 grid gap-2.5">
              <Link
                href="/anfrage"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Überführung anfragen
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
