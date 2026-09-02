import { LegalPageFromData } from '@/components/transfer/legal';
import { content } from '@/content';
import { legalMetadata } from '@/lib/metadata';

const locale = 'de' as const;

export const metadata = legalMetadata('cookies', locale);

export default function Page() {
  return <LegalPageFromData page={content(locale).legal.cookies} locale={locale} />;
}
