'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { quoteBulkyRequest, type ActionResult } from '@/app/admin/actions';
import { parseEuroToCents } from '@/lib/pricing';
import { BULKY_STATUSES, bulkyStatusLabels, type BulkyStatus } from '@/lib/shipment-status';

export function QuoteForm({
  requestId,
  currentStatus,
  currentPriceCents,
  currentNote,
  hasEmail,
}: {
  requestId: string;
  currentStatus: BulkyStatus;
  currentPriceCents: number | null;
  currentNote: string | null;
  hasEmail: boolean;
}) {
  const [status, setStatus] = useState<string>(
    currentStatus === 'NEW' ? 'IN_REVIEW' : currentStatus,
  );
  const [price, setPrice] = useState(
    currentPriceCents != null ? (currentPriceCents / 100).toFixed(2).replace('.', ',') : '',
  );
  const [note, setNote] = useState(currentNote ?? '');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);

    const cents = parseEuroToCents(price);
    if (status === 'QUOTED' && cents === null) {
      setResult({ ok: false, error: 'Bitte gib einen gültigen Preis ein.' });
      return;
    }

    startTransition(async () => {
      setResult(
        await quoteBulkyRequest({
          requestId,
          status,
          ...(cents !== null ? { quotedPriceCents: cents } : {}),
          quoteNote: note,
        }),
      );
    });
  }

  return (
    <form onSubmit={submit} className="surface p-5">
      <h2 className="font-semibold">Angebot erstellen</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Beim Status „Angebot erstellt“ bekommt der Kunde automatisch eine E-Mail mit einem
        persönlichen Link, über den er zusagen kann.
      </p>

      <div className="mt-4 space-y-4">
        <Field label="Pauschalpreis (€)" htmlFor="quote-price" hint="z. B. 85,00">
          <Input
            id="quote-price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="85,00"
            className="text-lg font-semibold"
          />
        </Field>

        <Field
          label="Hinweis für den Kunden"
          htmlFor="quote-note"
          hint="Erscheint im Angebot und in der E-Mail."
        >
          <Textarea
            id="quote-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Preis inkl. Abholung im Erdgeschoss. Transport auf der Tour Mitte des Monats."
          />
        </Field>

        <Field label="Status" htmlFor="quote-status">
          <Select id="quote-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {BULKY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {bulkyStatusLabels[s]}
              </option>
            ))}
          </Select>
        </Field>

        {status === 'QUOTED' && !hasEmail && (
          <Alert tone="warning" title="Keine E-Mail-Adresse hinterlegt">
            Das Angebot wird gespeichert, aber nicht automatisch versendet. Kontaktiere den Kunden
            telefonisch oder per WhatsApp und schicke ihm den Angebotslink.
          </Alert>
        )}

        {result && (
          <Alert tone={result.ok ? 'success' : 'error'}>
            {result.ok ? (result.message ?? 'Gespeichert.') : result.error}
          </Alert>
        )}

        <Button type="submit" disabled={pending} block>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
          {status === 'QUOTED' ? 'Angebot speichern und senden' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
}
