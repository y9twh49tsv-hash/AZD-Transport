import type { Metadata } from 'next';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('legal.liability.title') };
}

export default async function LiabilityPage() {
  const t = await getT();

  return (
    <LegalPage title={t('legal.liability.title')} intro={t('legal.liability.intro')}>
      <Section title={t('legal.liability.s1Title')}>
        <p>
          {t('legal.liability.s1p')} <Todo>{t('legal.liability.s1todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.liability.s2Title')}>
        <p>
          <Todo>{t('legal.liability.s2todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.liability.s3Title')}>
        <p>{t('legal.liability.s3p')}</p>
      </Section>

      <Section title={t('legal.liability.s4Title')}>
        <p>{t('legal.liability.s4p')}</p>
      </Section>

      <Section title={t('legal.liability.s5Title')}>
        <p>
          {t('legal.liability.s5p1')} <strong>{t('legal.liability.s5strong')}</strong>{' '}
          {t('legal.liability.s5p2')} <Todo>{t('legal.liability.s5todo')}</Todo>{' '}
          {t('legal.liability.s5p3')}
        </p>
      </Section>

      <Section title={t('legal.liability.s6Title')}>
        <p>{t('legal.liability.s6p')}</p>
      </Section>

      <Section title={t('legal.liability.s7Title')}>
        <p>
          <Todo>{t('legal.liability.s7todo')}</Todo>
        </p>
      </Section>
    </LegalPage>
  );
}
