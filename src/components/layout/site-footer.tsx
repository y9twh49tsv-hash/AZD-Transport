import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { brand } from '@/config/brand';
import { t } from '@/lib/i18n';

const serviceLinks = [
  { href: '/preisrechner', label: t('nav.calculator') },
  { href: '/buchen', label: t('nav.booking') },
  { href: '/tracking', label: t('nav.tracking') },
  { href: '/sperrgut', label: t('nav.bulky') },
];

const legalLinks = [
  { href: '/impressum', label: t('footer.imprint') },
  { href: '/datenschutz', label: t('footer.privacy') },
  { href: '/agb', label: t('footer.terms') },
  { href: '/versandbedingungen', label: t('footer.shippingTerms') },
  { href: '/verbotene-waren', label: t('footer.prohibited') },
  { href: '/haftung', label: t('footer.liability') },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {brand.tagline}. Persönlich, transparent und mit lückenloser Sendungsverfolgung.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{t('footer.service')}</h2>
          <ul className="mt-4 space-y-2.5">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{t('footer.legal')}</h2>
          <ul className="mt-4 space-y-2.5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{t('footer.company')}</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                {brand.address.street}
                <br />
                {brand.address.zip} {brand.address.city}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="hover:text-foreground">
                {brand.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <a href={`mailto:${brand.email}`} className="break-all hover:text-foreground">
                {brand.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. Alle Rechte vorbehalten.
          </p>
          <p>Preise inkl. gesetzlicher Umsatzsteuer, sofern anwendbar.</p>
        </div>
      </div>
    </footer>
  );
}
