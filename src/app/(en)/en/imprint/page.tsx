import { ImprintPage } from '@/components/transfer/legal-pages';
import { legalMetadata } from '@/lib/metadata';

const locale = 'en' as const;

export const metadata = legalMetadata('imprint', locale);

export default function Page() {
  return <ImprintPage locale={locale} />;
}
