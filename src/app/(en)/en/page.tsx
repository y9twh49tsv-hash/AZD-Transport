import type { Metadata } from 'next';
import { HomePage } from '@/components/transfer/home-page';
import { content } from '@/content';
import { pageMetadata } from '@/lib/metadata';

const locale = 'en' as const;

export const metadata: Metadata = {
  ...pageMetadata({
    key: 'home',
    locale,
    title: content(locale).meta.title,
    description: content(locale).meta.description,
  }),
  // Die Startseite trägt ihren vollen Titel, nicht den der Vorlage — sonst
  // stünde der Firmenname zweimal im Browsertab.
  title: { absolute: content(locale).meta.title },
};

export default function Page() {
  return <HomePage locale={locale} />;
}
