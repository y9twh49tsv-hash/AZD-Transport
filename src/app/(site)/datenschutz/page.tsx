import type { Metadata } from 'next';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { brand } from '@/config/brand';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('legal.privacy.title') };
}

export default async function PrivacyPage() {
  const t = await getT();

  return (
    <LegalPage title={t('legal.privacy.title')} intro={t('legal.privacy.intro')}>
      <Section title={t('legal.privacy.s1Title')}>
        <p>
          {t('legal.privacy.s1p', {
            legalName: brand.legalName,
            street: brand.address.street,
            zip: brand.address.zip,
            city: brand.address.city,
            country: brand.address.country,
            email: brand.email,
            phone: brand.phone,
          })}
        </p>
        <p>
          <Todo>{t('legal.privacy.s1todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.privacy.s2Title')}>
        <p>{t('legal.privacy.s2p')}</p>
        <ul>
          <li>{t('legal.privacy.s2li1')}</li>
          <li>{t('legal.privacy.s2li2')}</li>
          <li>{t('legal.privacy.s2li3')}</li>
          <li>{t('legal.privacy.s2li4')}</li>
          <li>{t('legal.privacy.s2li5')}</li>
          <li>{t('legal.privacy.s2li6')}</li>
          <li>{t('legal.privacy.s2li7')}</li>
          <li>{t('legal.privacy.s2li8')}</li>
        </ul>
        <p>{t('legal.privacy.s2after')}</p>
      </Section>

      <Section title={t('legal.privacy.s3Title')}>
        <ul>
          <li>
            <strong>{t('legal.privacy.s3li1Law')}</strong> {t('legal.privacy.s3li1')}
          </li>
          <li>
            <strong>{t('legal.privacy.s3li2Law')}</strong> {t('legal.privacy.s3li2')}
          </li>
          <li>
            <strong>{t('legal.privacy.s3li3Law')}</strong> {t('legal.privacy.s3li3')}
          </li>
        </ul>
      </Section>

      <Section title={t('legal.privacy.s4Title')}>
        <p>{t('legal.privacy.s4p')}</p>
        <ul>
          {/*
            Die Anbieter stehen namentlich hier und nicht im Wörterbuch: sie
            sind ein Fakt über den Betrieb, kein übersetzbarer Satz — und wenn
            der Hoster wechselt, darf er nicht in vier Dateien stehen bleiben.
          */}
          <li>
            <strong>Railway Corp.</strong> {t('legal.privacy.s4li1')}{' '}
            <Todo>{t('legal.privacy.s4li1todo')}</Todo>
          </li>
          <li>
            <strong>Supabase</strong> {t('legal.privacy.s4li2')}{' '}
            <Todo>{t('legal.privacy.s4li2todo')}</Todo>
          </li>
          <li>
            <strong>Resend</strong> {t('legal.privacy.s4li3')}{' '}
            <Todo>{t('legal.privacy.s4li3todo')}</Todo>
          </li>
        </ul>
        <p>
          {t('legal.privacy.s4after')} <Todo>{t('legal.privacy.s4todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.privacy.s5Title')}>
        <p>
          {t('legal.privacy.s5p')} <strong>{t('legal.privacy.s5strong')}</strong>
        </p>
      </Section>

      <Section title={t('legal.privacy.s6Title')}>
        <p>
          {t('legal.privacy.s6p')} <Todo>{t('legal.privacy.s6todo')}</Todo>.
        </p>
      </Section>

      <Section title={t('legal.privacy.s7Title')}>
        <ul>
          <li>{t('legal.privacy.s7li1')}</li>
          <li>{t('legal.privacy.s7li2')}</li>
          <li>{t('legal.privacy.s7li3')}</li>
          <li>{t('legal.privacy.s7li4')}</li>
          <li>{t('legal.privacy.s7li5')}</li>
          <li>{t('legal.privacy.s7li6')}</li>
          <li>{t('legal.privacy.s7li7')}</li>
        </ul>
        <p>{t('legal.privacy.s7after', { email: brand.email })}</p>
      </Section>

      <Section title={t('legal.privacy.s8Title')}>
        <p>
          {t('legal.privacy.s8p')} <Todo>{t('legal.privacy.s8todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.privacy.s9Title')}>
        <p>{t('legal.privacy.s9p')}</p>
      </Section>
    </LegalPage>
  );
}
