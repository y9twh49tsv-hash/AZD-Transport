import type { Metadata } from 'next';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { brand } from '@/config/brand';
import { siteConfig } from '@/config/site';
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

      {/* Belegt durch die Gewerbeanmeldung — dieselbe Quelle wie auf der
          Hauptseite, damit beide Impressen nicht auseinanderlaufen können. */}
      <Section title={t('legal.imprint.s3Title')}>
        <p>{siteConfig.ownerName}</p>
      </Section>

      {/* Wie auf der Hauptseite: § 5 DDG verlangt die USt-IdNr. nur, soweit
          sie vorhanden ist. Ohne Eintrag in `site.ts` entfällt der Abschnitt,
          statt eine Überschrift ohne Inhalt stehen zu lassen. */}
      {siteConfig.vatId && (
        <Section title={t('legal.imprint.s4Title')}>
          <p>{siteConfig.vatId}</p>
        </Section>
      )}

      <Section title={t('legal.imprint.s5Title')}>
        <p>
          <Todo>{t('legal.imprint.s5todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.imprint.s6Title')}>
        <p>
          {siteConfig.ownerName}
          <br />
          {brand.address.street}
          <br />
          {brand.address.zip} {brand.address.city}
        </p>
      </Section>

      {/*
        Der Abschnitt zur EU-Plattform für Online-Streitbeilegung ist entfallen.
        Die Plattform wurde am 20. Juli 2025 abgeschaltet; der Link ging ins
        Leere und der Satz behauptete etwas, das es nicht mehr gibt.
      */}

      {/* Dieselbe Aussage wie im Impressum der Hauptseite: es ist ein
          Unternehmen, also darf hier nicht das Gegenteil stehen. */}
      <Section title={t('legal.imprint.s8Title')}>
        <p>{t('legal.imprint.s8p')}</p>
      </Section>
    </LegalPage>
  );
}
