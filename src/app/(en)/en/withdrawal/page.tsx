import { WithdrawalPage } from '@/components/transfer/legal-pages';
import { legalMetadata } from '@/lib/metadata';

const locale = 'en' as const;

export const metadata = legalMetadata('withdrawal', locale);

export default function Page() {
  return <WithdrawalPage locale={locale} />;
}
