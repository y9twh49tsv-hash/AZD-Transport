import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { isTodo, siteConfig, telLink, whatsappRequestLink } from '@/config/site';

const LEGAL = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutz' },
  { href: '/agb', label: 'AGB' },
  { href: '/widerruf', label: 'Widerruf' },
];

const NAV = [
  { href: '/#leistungen', label: 'Leistungen' },
  { href: '/#premium', label: 'Premium-Service' },
  { href: '/#unternehmen', label: 'Für Unternehmen' },
  { href: '/#ablauf', label: 'Ablauf' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/anfrage', label: 'Anfrage' },
];

export function SiteFooter() {
  const { address } = siteConfig;
  // Eine unbestätigte Anschrift wird nicht gedruckt. Lieber eine Lücke, die
  // auffällt, als eine Musteradresse, die niemand mehr hinterfragt.
  const addressKnown = !isTodo(address.street) && !isTodo(address.postalCode);

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.22em]">AZD</p>
          <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Transport
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {siteConfig.shortDescription} {siteConfig.serviceArea}.
          </p>
        </div>

        <div>
          <h2 className="eyebrow">Navigation</h2>
          <ul className="mt-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Rechtliches</h2>
          <ul className="mt-3">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Kontakt</h2>
          <ul className="mt-3 text-sm">
            <li>
              <a
                href={telLink()}
                className="inline-flex min-h-11 items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappRequestLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="size-4 shrink-0 text-primary" aria-hidden />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex min-h-11 items-center gap-2.5 break-all text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                {siteConfig.email}
              </a>
            </li>
            {addressKnown && (
              <li className="text-muted-foreground">
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.companyName}
          </p>
          <p>Fahrzeugüberführungen auf eigener Achse — kein Transport auf Anhänger.</p>
        </div>
      </div>
    </footer>
  );
}
