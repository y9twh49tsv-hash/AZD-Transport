'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { decideOnOffer } from '@/app/(site)/sperrgut/actions';

export function OfferActions({ token }: { token: string }) {
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
        <Alert tone="error" title="Das hat nicht geklappt">
          {error}
        </Alert>
      )}

      {confirming === 'accept' ? (
        <Alert tone="info" title="Angebot verbindlich annehmen?">
          <p>Wir legen daraufhin deine Sendung an und melden uns zur Terminabstimmung.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => decide('accept')} disabled={pending}>
              {pending ? 'Wird gesendet …' : 'Ja, Angebot annehmen'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(null)} disabled={pending}>
              Abbrechen
            </Button>
          </div>
        </Alert>
      ) : confirming === 'reject' ? (
        <Alert tone="warning" title="Angebot ablehnen?">
          <p>Du kannst uns jederzeit eine neue Anfrage schicken.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="destructive" onClick={() => decide('reject')} disabled={pending}>
              {pending ? 'Wird gesendet …' : 'Ja, ablehnen'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(null)} disabled={pending}>
              Abbrechen
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => setConfirming('accept')} className="sm:flex-1">
            <Check aria-hidden />
            Angebot annehmen
          </Button>
          <Button size="lg" variant="outline" onClick={() => setConfirming('reject')} className="sm:flex-1">
            <X aria-hidden />
            Ablehnen
          </Button>
        </div>
      )}
    </div>
  );
}
