import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brand } from '@/config/brand';
import { whatsappLink } from '@/lib/notifications/whatsapp';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t('contact.metaTitle'),
    description: t('contact.metaDescription', { brand: brand.name }),
  };
}

export default async function ContactPage() {
  const t = await getT();

  // In der Funktion: auf Modulebene stünden die Fragen für immer in der
  // Sprache, die beim Laden des Moduls galt.
  const faq = [1, 2, 3, 4].map((n) => ({
    q: t(`contact.faq${n}Q`),
    a: t(`contact.faq${n}A`),
  }));

  return (
    <div className="container max-w-3xl py-10 sm:py-16">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('contact.title')}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          {t('contact.intro')}
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={whatsappLink(brand.whatsapp, t('contact.whatsappGreeting', { brand: brand.name }))}
          target="_blank"
          rel="noopener noreferrer"
          className="surface flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <MessageCircle className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">WhatsApp</span>
            <span className="block text-sm text-muted-foreground">
              {t('contact.whatsappHint')}
            </span>
          </span>
        </a>

        <a
          href={`tel:${brand.phone.replace(/\s/g, '')}`}
          className="surface flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <Phone className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">{t('contact.phone')}</span>
            <span className="block text-sm text-muted-foreground">{brand.phone}</span>
          </span>
        </a>

        <a
          href={`mailto:${brand.email}`}
          className="surface flex items-start gap-4 p-5 transition-shadow hover:shadow-lift"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <Mail className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">{t('fields.email')}</span>
            <span className="block break-all text-sm text-muted-foreground">{brand.email}</span>
          </span>
        </a>

        <div className="surface flex items-start gap-4 p-5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <MapPin className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">{t('contact.dropOffPoint')}</span>
            <span className="block text-sm text-muted-foreground">
              {brand.address.street}
              <br />
              {brand.address.zip} {brand.address.city}
            </span>
          </span>
        </div>
      </div>

      <section className="surface mt-8 p-6">
        <h2 className="text-lg font-semibold tracking-tight">{t('contact.faqTitle')}</h2>
        <dl className="mt-5 space-y-5 text-sm">
          {faq.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1 leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <Link href="/preisrechner">
            <Button block className="sm:w-auto">
              {t('common.calculatePrice')}
            </Button>
          </Link>
          <Link href="/sperrgut">
            <Button variant="outline" block className="sm:w-auto">
              {t('bulky.title')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
