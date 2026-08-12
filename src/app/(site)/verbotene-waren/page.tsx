import type { Metadata } from 'next';
import { Ban } from 'lucide-react';
import { LegalPage, Section, Todo } from '@/components/layout/legal-page';
import { prohibitedCategoryIds } from '@/config/prohibited-items';
import { brand } from '@/config/brand';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('legal.prohibited.title') };
}

export default async function ProhibitedItemsPage() {
  const t = await getT();

  const categories = prohibitedCategoryIds.map((id) => ({
    id,
    title: t(`legal.prohibited.${id}Title`),
    examples: t(`legal.prohibited.${id}Examples`),
    // Nicht jede Kategorie hat eine Anmerkung; im Wörterbuch steht dann ein
    // leerer String, damit die Form über alle vier Sprachen gleich bleibt.
    note: t(`legal.prohibited.${id}Note`),
  }));

  return (
    <LegalPage title={t('legal.prohibited.title')} intro={t('legal.prohibited.intro')}>
      <Section title={t('legal.prohibited.s1Title')}>
        <ul className="!ms-0 !list-none space-y-4">
          {categories.map((category) => (
            <li key={category.id} className="!ms-0 rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <Ban className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
                <div className="min-w-0">
                  <h3>{category.title}</h3>
                  <p className="mt-1 text-sm">
                    {t('legal.prohibited.forExample', { examples: category.examples })}
                  </p>
                  {category.note && (
                    <p className="mt-1.5 text-sm italic text-muted-foreground">{category.note}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('legal.prohibited.s2Title')}>
        <p>{t('legal.prohibited.s2p', { email: brand.email, phone: brand.phone })}</p>
      </Section>

      <Section title={t('legal.prohibited.s3Title')}>
        <p>
          {t('legal.prohibited.s3p')} <Todo>{t('legal.prohibited.s3todo')}</Todo>
        </p>
      </Section>

      <Section title={t('legal.prohibited.s4Title')}>
        <p>
          <Todo>{t('legal.prohibited.s4todo')}</Todo>
        </p>
      </Section>
    </LegalPage>
  );
}
