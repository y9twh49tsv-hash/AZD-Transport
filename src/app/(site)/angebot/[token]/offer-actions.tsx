'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { decideOnOffer } from '@/app/(site)/sperrgut/actions';
import { useT } from '@/lib/i18n/client';

export function OfferActions({ token }: { token: string }) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'accept' | 'reject' | null>(null);
  const [pending, startTransition] = useTransition();

  function decide(decision: 'accept' | 'reject') {
    setError(null);
    startTransition(async () => {
      const result = await decideOnOffer(token, decision);
      if (!result.ok) {
        setError(result.error);
        setConfirming(null);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert tone="error" title={t('offer.failedTitle')}>
          {error}
        </Alert>
      )}

      {confirming === 'accept' ? (
        <Alert tone="info" title={t('offer.confirmAcceptTitle')}>
          <p>{t('offer.confirmAcceptText')}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => decide('accept')} disabled={pending}>
              {pending ? t('offer.sending') : t('offer.confirmAcceptYes')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(null)} disabled={pending}>
              {t('common.cancel')}
            </Button>
          </div>
        </Alert>
      ) : confirming === 'reject' ? (
        <Alert tone="warning" title={t('offer.confirmRejectTitle')}>
          <p>{t('offer.confirmRejectText')}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="destructive" onClick={() => decide('reject')} disabled={pending}>
              {pending ? t('offer.sending') : t('offer.confirmRejectYes')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(null)} disabled={pending}>
              {t('common.cancel')}
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => setConfirming('accept')} className="sm:flex-1">
            <Check aria-hidden />
            {t('offer.accept')}
          </Button>
          <Button size="lg" variant="outline" onClick={() => setConfirming('reject')} className="sm:flex-1">
            <X aria-hidden />
            {t('offer.reject')}
          </Button>
        </div>
      )}
    </div>
  );
}
