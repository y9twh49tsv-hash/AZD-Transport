'use client';

import { ErrorPage } from '@/components/transfer/status-pages';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage locale="en" digest={error.digest} reset={reset} />;
}
