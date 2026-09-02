import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { isTodo, siteConfig, telLink, whatsappRequestLink } from '@/config/site';
import { content, pagePath, type Locale } from '@/content';
import { LanguageSwitch } from './language-switch';

/**
 * Die Fußzeile.
 *
 * Die Rechtslinks kommen aus `PAGES` und nicht aus einer eigenen Liste: eine
 * zweite Liste derselben Adressen wäre die Stelle, an der nach dem Umbenennen
 * einer Seite ein toter Link zurückbleibt — ausgerechnet auf das Impressum.
 */

const LEGAL = ['imprint', 'privacy', 'cookies', 'terms', 'withdrawal'] as const;

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = content(locale);
  const { address } = siteConfig;
  const home = pagePath('home', locale);
  const anchor = home === '/' ? '' : home;

  // Eine unbestätigte Anschrift wird nicht gedruckt. Lieber eine Lücke, die
  // auffällt, als eine Musteradresse, die niemand mehr hinterfragt.
  const addressKnown = !isTodo(address.street) && !isTodo(address.postalCode);

  const nav = [
    { href: `${anchor}/#leistungen`, label: t.nav.services },
    { href: `${anchor}/#premium`, label: t.nav.premium },
    { href: `${anchor}/#unternehmen`, label: t.nav.business },
    { href: `${anchor}/#ablauf`, label: t.nav.process },
    { href: `${anchor}/#faq`, label: t.nav.faq },
    { href: pagePath('request', locale), label: t.nav.request },
  ];

  const legal = LEGAL.map((key) => ({
    href: pagePath(key, locale),
    label: t.legal[key].title,
  }));

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.22em]">AZD</p>
          <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Transport
          </p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t.footer.tagline} {t.company.serviceArea}.
          </p>

          {/* Auch hier, nicht nur oben: wer die Seite gelesen hat und erst am
              Ende merkt, dass es sie in der eigenen Sprache gibt, soll nicht
              zurückscrollen müssen. */}
          <LanguageSwitch
            locale={locale}
            className="mt-5 inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          />
        </div>

        <div>
          <h2 className="eyebrow">{t.nav.navigation}</h2>
          <ul className="mt-3">
            {nav.map((item) => (
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
          <h2 className="eyebrow">{t.nav.legal}</h2>
          <ul className="mt-3">
            {legal.map((item) => (
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
          <h2 className="eyebrow">{t.nav.contact}</h2>
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
                href={whatsappRequestLink(t.whatsappOpener)}
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
          <p>{t.footer.claim}</p>
        </div>
      </div>
    </footer>
  );
}
