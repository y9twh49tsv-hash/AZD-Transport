'use client';

import { useState, useTransition } from 'react';
import { Ban, Check, Euro, Loader2, QrCode, ShieldCheck, Truck, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import {
  addSecuritySeal,
  assignDriver,
  assignShipmentToTrip,
  cancelShipment,
  recordPayment,
  schedulePickup,
  updateShipmentDetails,
  updateShipmentStatus,
  type ActionResult,
} from '@/app/admin/actions';
import { allowedTransitions, statusMeta, type ShipmentStatus } from '@/lib/shipment-status';
import { parseEuroToCents } from '@/lib/pricing';
import { PAYMENT_STATUSES, paymentStatusLabels } from '@/lib/shipment-status';

type Driver = { id: string; name: string };
type Trip = { id: string; code: string; label: string };

function useAction() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<ActionResult>) => {
    setResult(null);
    startTransition(async () => setResult(await fn()));
  };

  return { result, pending, run, clear: () => setResult(null) };
}

function ResultMessage({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <Alert tone={result.ok ? 'success' : 'error'} className="mt-4">
      {result.ok ? (result.message ?? 'Gespeichert.') : result.error}
    </Alert>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Check;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-primary" aria-hidden />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function StatusPanel({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const { result, pending, run } = useAction();
  const [status, setStatus] = useState<string>('');
  const [location, setLocation] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');

  const options = allowedTransitions(currentStatus);

  return (
    <Panel title="Status ändern" icon={Check}>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Diese Sendung ist abgeschlossen („{statusMeta[currentStatus].label}“). Weitere
          Statusänderungen sind nicht möglich.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!status) return;
            run(() =>
              updateShipmentStatus({ shipmentId, status, location, publicMessage, internalNote }),
            );
          }}
          className="space-y-4"
        >
          <Field label="Neuer Status" htmlFor="new-status" required>
            <Select
              id="new-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                const meta = statusMeta[e.target.value as ShipmentStatus];
                setPublicMessage(meta?.publicMessage ?? '');
              }}
              required
            >
              <option value="">Bitte wählen …</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {statusMeta[option].label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Standort" htmlFor="status-location" hint="z. B. Depot Frankfurt, Spanien, Nador">
            <Input
              id="status-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
            />
          </Field>

          <Field
            label="Nachricht für den Kunden"
            htmlFor="status-message"
            hint="Erscheint in der öffentlichen Sendungsverfolgung."
          >
            <Textarea
              id="status-message"
              rows={2}
              value={publicMessage}
              onChange={(e) => setPublicMessage(e.target.value)}
              maxLength={500}
            />
          </Field>

          <Field
            label="Interne Notiz"
            htmlFor="status-note"
            hint="Nur intern sichtbar — niemals für den Kunden."
          >
            <Textarea
              id="status-note"
              rows={2}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              maxLength={2000}
            />
          </Field>

          <Button type="submit" disabled={pending || !status} block>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            Status speichern
          </Button>
        </form>
      )}
      <ResultMessage result={result} />
    </Panel>
  );
}

export function SealPanel({
  shipmentId,
  currentSeal,
}: {
  shipmentId: string;
  currentSeal?: string | null;
}) {
  const { result, pending, run } = useAction();
  const [sealNumber, setSealNumber] = useState('');
  const [note, setNote] = useState('');

  return (
    <Panel title="Sicherheitsnummer" icon={ShieldCheck}>
      {currentSeal && (
        <p className="mb-4 rounded-xl bg-primary-muted p-3 text-sm">
          Aktuell versiegelt mit{' '}
          <strong className="font-mono">{currentSeal}</strong>
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addSecuritySeal({ shipmentId, sealNumber, note }));
        }}
        className="space-y-4"
      >
        <Field
          label="Plomben- / Beutelnummer"
          htmlFor="seal-number"
          hint="Erscheint im Kundentracking, z. B. SEC-583921."
          required
        >
          <Input
            id="seal-number"
            value={sealNumber}
            onChange={(e) => setSealNumber(e.target.value.toUpperCase())}
            placeholder="SEC-583921"
            className="font-mono"
            required
          />
        </Field>

        <Field label="Bemerkung" htmlFor="seal-note">
          <Input
            id="seal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Großer Sicherheitsbeutel, versiegelt im Depot"
          />
        </Field>

        <Button type="submit" disabled={pending || !sealNumber} block variant="outline">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
          {currentSeal ? 'Neue Nummer speichern' : 'Nummer speichern'}
        </Button>
      </form>
      <ResultMessage result={result} />
    </Panel>
  );
}

export function EditPanel({
  shipmentId,
  weightKg,
  pieceCount,
  priceTotalCents,
  paymentStatus,
  internalNotes,
}: {
  shipmentId: string;
  weightKg: number;
  pieceCount: number;
  priceTotalCents: number;
  paymentStatus: string;
  internalNotes: string | null;
}) {
  const { result, pending, run } = useAction();
  const [weight, setWeight] = useState(String(weightKg));
  const [pieces, setPieces] = useState(String(pieceCount));
  const [price, setPrice] = useState((priceTotalCents / 100).toFixed(2).replace('.', ','));
  const [payment, setPayment] = useState(paymentStatus);
  const [notes, setNotes] = useState(internalNotes ?? '');
  const [priceTouched, setPriceTouched] = useState(false);

  return (
    <Panel title="Sendung bearbeiten" icon={Euro}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() =>
            updateShipmentDetails({
              shipmentId,
              weightKg: weight,
              pieceCount: pieces,
              // Only send a price when it was edited by hand — otherwise the
              // server recalculates it from the weight.
              ...(priceTouched ? { priceTotalCents: parseEuroToCents(price) ?? undefined } : {}),
              paymentStatus: payment,
              internalNotes: notes,
            }),
          );
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gewicht (kg)" htmlFor="edit-weight">
            <Input
              id="edit-weight"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
          <Field label="Gepäckstücke" htmlFor="edit-pieces">
            <Input
              id="edit-pieces"
              type="number"
              min={1}
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Gesamtpreis (€)"
          htmlFor="edit-price"
          hint={
            priceTouched
              ? 'Manueller Preis — überschreibt die automatische Berechnung.'
              : 'Wird beim Ändern des Gewichts automatisch neu berechnet.'
          }
        >
          <Input
            id="edit-price"
            inputMode="decimal"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setPriceTouched(true);
            }}
          />
        </Field>

        <Field label="Zahlungsstatus" htmlFor="edit-payment">
          <Select id="edit-payment" value={payment} onChange={(e) => setPayment(e.target.value)}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {paymentStatusLabels[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Interne Notizen" htmlFor="edit-notes">
          <Textarea id="edit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <Button type="submit" disabled={pending} block variant="outline">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Änderungen speichern
        </Button>
      </form>
      <ResultMessage result={result} />
    </Panel>
  );
}

export function PickupPanel({
  shipmentId,
  drivers,
  scheduledDate,
}: {
  shipmentId: string;
  drivers: Driver[];
  scheduledDate?: string | null;
}) {
  const { result, pending, run } = useAction();
  const [date, setDate] = useState(scheduledDate ?? '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [driverId, setDriverId] = useState('');
  const [note, setNote] = useState('');

  return (
    <Panel title="Abholung planen" icon={Truck}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() =>
            schedulePickup({
              shipmentId,
              scheduledDate: date,
              timeWindowStart: start,
              timeWindowEnd: end,
              driverId,
              note,
            }),
          );
        }}
        className="space-y-4"
      >
        <Field label="Datum" htmlFor="pickup-date" required>
          <Input
            id="pickup-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Zeitfenster von" htmlFor="pickup-start">
            <Input id="pickup-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="bis" htmlFor="pickup-end">
            <Input id="pickup-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>

        <Field label="Fahrer" htmlFor="pickup-driver">
          <Select id="pickup-driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">Noch offen</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Hinweis für den Fahrer" htmlFor="pickup-note">
          <Input
            id="pickup-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="3. Stock, bitte vorher anrufen"
          />
        </Field>

        <Button type="submit" disabled={pending || !date} block variant="outline">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Abholung speichern
        </Button>
      </form>
      <ResultMessage result={result} />
    </Panel>
  );
}

export function AssignmentPanel({
  shipmentId,
  drivers,
  trips,
  currentDriverId,
  currentTripId,
}: {
  shipmentId: string;
  drivers: Driver[];
  trips: Trip[];
  currentDriverId: string | null;
  currentTripId: string | null;
}) {
  const driverAction = useAction();
  const tripAction = useAction();
  const [driverId, setDriverId] = useState(currentDriverId ?? '');
  const [tripId, setTripId] = useState(currentTripId ?? '');

  return (
    <Panel title="Zuweisung" icon={UserCog}>
      <div className="space-y-5">
        <div>
          <Field label="Fahrer" htmlFor="assign-driver">
            <Select id="assign-driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">Kein Fahrer</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            disabled={driverAction.pending}
            onClick={() => driverAction.run(() => assignDriver({ shipmentId, driverId }))}
          >
            {driverAction.pending && <Loader2 className="animate-spin" aria-hidden />}
            Fahrer speichern
          </Button>
          <ResultMessage result={driverAction.result} />
        </div>

        <div className="border-t border-border pt-5">
          <Field label="Tour" htmlFor="assign-trip">
            <Select id="assign-trip" value={tripId} onChange={(e) => setTripId(e.target.value)}>
              <option value="">Keiner Tour zugeordnet</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            disabled={tripAction.pending}
            onClick={() => tripAction.run(() => assignShipmentToTrip({ shipmentId, tripId }))}
          >
            {tripAction.pending && <Loader2 className="animate-spin" aria-hidden />}
            Tour speichern
          </Button>
          <ResultMessage result={tripAction.result} />
        </div>
      </div>
    </Panel>
  );
}

export function PaymentPanel({
  shipmentId,
  priceTotalCents,
}: {
  shipmentId: string;
  priceTotalCents: number;
}) {
  const { result, pending, run } = useAction();
  const [amount, setAmount] = useState((priceTotalCents / 100).toFixed(2).replace('.', ','));
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'online' | 'other'>('cash');
  const [note, setNote] = useState('');

  return (
    <Panel title="Zahlung erfassen" icon={Euro}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cents = parseEuroToCents(amount);
          if (!cents) return;
          run(() => recordPayment({ shipmentId, amountCents: cents, method, note }));
        }}
        className="space-y-4"
      >
        <Field label="Betrag (€)" htmlFor="pay-amount" required>
          <Input
            id="pay-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>

        <Field label="Zahlungsart" htmlFor="pay-method">
          <Select
            id="pay-method"
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
          >
            <option value="cash">Bar</option>
            <option value="bank_transfer">Überweisung</option>
            <option value="online">Online</option>
            <option value="other">Sonstiges</option>
          </Select>
        </Field>

        <Field label="Notiz" htmlFor="pay-note">
          <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <Button type="submit" disabled={pending} block variant="outline">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Zahlung buchen
        </Button>
      </form>
      <ResultMessage result={result} />
    </Panel>
  );
}

export function DangerPanel({ shipmentId }: { shipmentId: string }) {
  const { result, pending, run } = useAction();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-destructive">
        <Ban className="size-4" aria-hidden />
        Sendung stornieren
      </h2>

      {!confirming ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Die Sendung bleibt mit ihrer gesamten Historie erhalten und wird als storniert markiert.
            Danach sind keine Statusänderungen mehr möglich.
          </p>
          <Button variant="destructive" size="sm" className="mt-4" onClick={() => setConfirming(true)}>
            Stornieren
          </Button>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <Field label="Grund (intern)" htmlFor="cancel-reason">
            <Input
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Kunde hat storniert"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => run(() => cancelShipment({ shipmentId, reason }))}
            >
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              Ja, endgültig stornieren
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}
      <ResultMessage result={result} />
    </section>
  );
}

export function QrPreview({ svg, scanUrl }: { svg: string; scanUrl: string }) {
  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <QrCode className="size-4 text-primary" aria-hidden />
        QR-Code
      </h2>
      <div
        className="mx-auto mt-4 w-40 [&>svg]:h-auto [&>svg]:w-full"
        // The SVG is produced server-side by the qrcode library from our own
        // URL — no user input reaches this markup.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-3 break-all text-center text-xs text-muted-foreground">{scanUrl}</p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Enthält keine Kundendaten — nur einen zufälligen Token.
      </p>
    </section>
  );
}
