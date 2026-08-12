import type { Metadata } from 'next';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { brand } from '@/config/brand';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('legal.imprint.title') };
}

export default async function ImprintPage() {
  const t = await getT();

  return (
    <LegalPage title={t('legal.imprint.title')} intro={t('legal.imprint.intro')}>
      <Section title={t('legal.imprint.s1Title')}>
        {/*
          Firmenname und Anschrift bleiben unübersetzt: Pflichtangaben nach
          § 5 DDG müssen die Anschrift so nennen, wie sie tatsächlich lautet.
        */}
        <p>
          {brand.legalName}
          <br />
          {brand.address.street}
          <br />
          {brand.address.zip} {brand.address.city}
          <br />
          {brand.address.country}
        </p>
      </Section>

      <Section title={t('legal.imprint.s2Title')}>
        <p>
          {t('legal.imprint.phone')}: {brand.phone}
          <br />
          {t('legal.imprint.email')}: {brand.email}
        </p>
      </Section>

      <Section title={t('legal.imprint.s3Title')}>
        <p>
          <Todo>{t('legal.imprint.s3todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.imprint.s4Title')}>
        <p>
          <Todo>{t('legal.imprint.s4todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.imprint.s5Title')}>
        <p>
          <Todo>{t('legal.imprint.s5todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.imprint.s6Title')}>
        <p>
          <Todo>{t('legal.imprint.s6todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.imprint.s7Title')}>
        <p>
          {t('legal.imprint.s7p1')}{' '}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            className="font-medium text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
          {t('legal.imprint.s7p2')}
        </p>
      </Section>

      <Section title={t('legal.imprint.s8Title')}>
        <p>
          <Todo>{t('legal.imprint.s8todo')}</Todo>
        </p>
      </Section>
    </LegalPage>
  );
}
