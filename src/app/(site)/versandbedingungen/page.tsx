import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('legal.shipping.title') };
}

export default async function ShippingTermsPage() {
  const t = await getT();

  return (
    <LegalPage title={t('legal.shipping.title')} intro={t('legal.shipping.intro')}>
      <Section title={t('legal.shipping.s1Title')}>
        <p>
          {t('legal.shipping.s1p1')}{' '}
          <Link href="/verbotene-waren" className="font-medium text-primary underline">
            {t('footer.prohibited')}
          </Link>{' '}
          {t('legal.shipping.s1p2')}
        </p>
      </Section>

      <Section title={t('legal.shipping.s2Title')}>
        <ul>
          <li>{t('legal.shipping.s2li1')}</li>
          <li>{t('legal.shipping.s2li2')}</li>
          <li>{t('legal.shipping.s2li3')}</li>
          <li>{t('legal.shipping.s2li4')}</li>
        </ul>
      </Section>

      <Section title={t('legal.shipping.s3Title')}>
        <p>{t('legal.shipping.s3p', { pickup: formatCents(pricingConfig.pickupFeeCents) })}</p>
      </Section>

      <Section title={t('legal.shipping.departuresTitle')}>
        <p>{t('legal.shipping.departuresText')}</p>
      </Section>

      <Section title={t('legal.shipping.s4Title')}>
        <p>
          {t('legal.shipping.s4p', {
            documents: formatCents(pricingConfig.documentsPriceCents),
            documentsMax: pricingConfig.maxDocumentsWeightKg,
          })}
        </p>
      </Section>

      <Section title={t('legal.shipping.s5Title')}>
        <p>{t('legal.shipping.s5p')}</p>
      </Section>

      <Section title={t('legal.shipping.s6Title')}>
        <p>{t('legal.shipping.s6p')}</p>
      </Section>

      <Section title={t('legal.shipping.s7Title')}>
        <p>{t('legal.shipping.s7p')}</p>
        <ul>
          <li>{t('legal.shipping.s7li1')}</li>
          <li>{t('legal.shipping.s7li2')}</li>
          <li>{t('legal.shipping.s7li3')}</li>
        </ul>
        <p>
          <Todo>{t('legal.shipping.s7todo')}</Todo>
        </p>
      </Section>
    </LegalPage>
  );
}
