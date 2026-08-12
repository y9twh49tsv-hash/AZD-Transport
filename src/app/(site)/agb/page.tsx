import type { Metadata } from 'next';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { pricingConfig } from '@/config/pricing';
import { formatCents } from '@/lib/pricing';
import { brand } from '@/config/brand';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('footer.terms') };
}

export default async function TermsPage() {
  const t = await getT();

  return (
    <LegalPage
      title={t('legal.terms.title')}
      intro={t('legal.terms.intro', { brand: brand.name })}
    >
      <Section title={t('legal.terms.s1Title')}>
        <p>{t('legal.terms.s1p', { legalName: brand.legalName })}</p>
      </Section>

      <Section title={t('legal.terms.s2Title')}>
        <p>{t('legal.terms.s2p')}</p>
      </Section>

      <Section title={t('legal.terms.s3Title')}>
        <ul>
          <li>{t('legal.terms.s3li1', { perKg: formatCents(pricingConfig.pricePerKgCents) })}</li>
          <li>
            {t('legal.terms.s3li2', { minimum: formatCents(pricingConfig.minimumPriceCents) })}
          </li>
          <li>{t('legal.terms.s3li3', { pickup: formatCents(pricingConfig.pickupFeeCents) })}</li>
          <li>
            {t('legal.terms.s3li4', {
              documents: formatCents(pricingConfig.documentsPriceCents),
              documentsMax: pricingConfig.maxDocumentsWeightKg,
            })}
          </li>
          <li>{t('legal.terms.s3li5')}</li>
        </ul>
        <p>{t('legal.terms.s3p')}</p>
      </Section>

      <Section title={t('legal.terms.s4Title')}>
        <ul>
          <li>{t('legal.terms.s4li1')}</li>
          <li>{t('legal.terms.s4li2')}</li>
          <li>{t('legal.terms.s4li3')}</li>
          <li>{t('legal.terms.s4li4')}</li>
        </ul>
      </Section>

      <Section title={t('legal.terms.s5Title')}>
        <p>{t('legal.terms.s5p')}</p>
      </Section>

      <Section title={t('legal.terms.s6Title')}>
        <p>{t('legal.shipping.departuresText')}</p>
        <p>
          <Todo>{t('legal.terms.s6todo')}</Todo> {t('legal.terms.s6p')}
        </p>
      </Section>

      <Section title={t('legal.terms.s7Title')}>
        <p>
          {t('legal.terms.s7p')} <Todo>{t('legal.terms.s7todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.terms.s8Title')}>
        <p>
          <Todo>{t('legal.terms.s8todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.terms.s9Title')}>
        <p>{t('legal.terms.s9p')}</p>
      </Section>
    </LegalPage>
  );
}
