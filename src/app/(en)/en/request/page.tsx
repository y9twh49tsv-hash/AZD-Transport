import type { Metadata } from 'next';
import { RequestPage } from '@/components/transfer/request-page';
import { content } from '@/content';
import { pageMetadata } from '@/lib/metadata';

const locale = 'en' as const;

export const metadata: Metadata = pageMetadata({
  key: 'request',
  locale,
  title: content(locale).request.title,
  description: content(locale).request.lead,
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kunde?: string }>;
}) {
  const { kunde } = await searchParams;
  return <RequestPage locale={locale} business={kunde === 'gewerblich'} />;
}
