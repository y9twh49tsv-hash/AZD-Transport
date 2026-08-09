'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input, Textarea } from '@/components/ui/input';
import { SignaturePad } from '@/components/driver/signature-pad';
import { createDriverUpload, driverUpdateShipment, type DriverResult } from '@/app/driver/actions';
import { createClient } from '@/lib/supabase/client';
import { prepareImage } from '@/lib/image';
import { allowedTransitions, statusMeta, type ShipmentStatus } from '@/lib/shipment-status';
import { cn } from '@/lib/utils';

/** Statuses a driver may set. Everything else stays with the office. */
const DRIVER_STATUSES: ShipmentStatus[] = [
  'PICKED_UP',
  'AT_GERMANY_HUB',
  'LOADED',
  'DEPARTED_GERMANY',
  'IN_TRANSIT',
  'ARRIVED_MOROCCO',
  'AT_MOROCCO_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
];

export function DriverForm({
  shipmentId,
  currentStatus,
  weightKg,
  pieceCount,
  currentSeal,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
  weightKg: number;
  pieceCount: number;
  currentSeal: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ShipmentStatus | ''>('');
  const [weight, setWeight] = useState(String(weightKg));
  const [pieces, setPieces] = useState(String(pieceCount));
  const [seal, setSeal] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [signature, setSignature] = useState<Blob | null>(null);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<DriverResult | null>(null);
  const [pending, startTransition] = useTransition();

  const available = allowedTransitions(currentStatus).filter((s) => DRIVER_STATUSES.includes(s));

  const isPickup = status === 'PICKED_UP';
  const isDelivery = status === 'DELIVERED';

  async function handlePhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try {
      const prepared = await prepareImage(file);
      setPhoto({ blob: prepared.blob, url: URL.createObjectURL(prepared.blob) });
    } catch {
      setResult({ ok: false, error: 'Das Foto konnte nicht verarbeitet werden.' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  /** Uploads a blob straight to Supabase Storage via a signed URL. */
  async function upload(blob: Blob, kind: 'pickup_photo' | 'delivery_photo' | 'signature') {
    const signed = await createDriverUpload({
      shipmentId,
      kind,
      mimeType: kind === 'signature' ? 'image/png' : 'image/jpeg',
      sizeBytes: blob.size,
    });

    if (!signed.ok) throw new Error(signed.error);

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(signed.bucket)
      .uploadToSignedUrl(signed.path, signed.token, blob, {
        contentType: kind === 'signature' ? 'image/png' : 'image/jpeg',
      });

    if (error) throw new Error('Der Upload ist fehlgeschlagen.');
    return signed.path;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) return;
    setResult(null);

    let photoPath: string | null = null;
    let signaturePath: string | null = null;

    if (photo || signature) {
      setUploading(true);
      try {
        if (photo) {
          photoPath = await upload(photo.blob, isDelivery ? 'delivery_photo' : 'pickup_photo');
        }
        if (signature) {
          signaturePath = await upload(signature, 'signature');
        }
      } catch (error) {
        setUploading(false);
        setResult({
          ok: false,
          error: error instanceof Error ? error.message : 'Der Upload ist fehlgeschlagen.',
        });
        return;
      }
      setUploading(false);
    }

    startTransition(async () => {
      const response = await driverUpdateShipment({
        shipmentId,
        status,
        weightKg: weight,
        pieceCount: pieces,
        sealNumber: seal,
        location,
        note,
        photoPath: photoPath ?? '',
        signaturePath: signaturePath ?? '',
      });

      setResult(response);
      if (response.ok) {
        setStatus('');
        setSeal('');
        setNote('');
        setPhoto(null);
        setSignature(null);
        router.refresh();
      }
    });
  }

  const busy = pending || uploading;

  if (available.length === 0) {
    return (
      <Alert tone="info" title="Nichts mehr zu tun">
        Diese Sendung ist im Status „{statusMeta[currentStatus].label}“. Weitere Schritte übernimmt
        das Büro.
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Status picker — big tap targets */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Was hast du gemacht?</legend>
        <div className="grid gap-2.5">
          {available.map((option) => {
            const meta = statusMeta[option];
            const Icon = meta.icon;
            const active = status === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(active ? '' : option)}
                aria-pressed={active}
                className={cn(
                  'flex min-h-14 items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card active:bg-secondary',
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="flex-1 font-semibold">{meta.label}</span>
                {active && <Check className="size-5" aria-hidden />}
              </button>
            );
          })}
        </div>
      </fieldset>

      {status && (
        <>
          {/* Pickup confirmations */}
          {isPickup && (
            <div className="surface space-y-4 p-4">
              <p className="text-sm font-semibold">Bitte bestätigen</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gewicht (kg)" htmlFor="d-weight">
                  <Input
                    id="d-weight"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </Field>
                <Field label="Gepäckstücke" htmlFor="d-pieces">
                  <Input
                    id="d-pieces"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={pieces}
                    onChange={(e) => setPieces(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </Field>
              </div>
              <p className="text-xs text-muted-foreground">
                Weicht das Gewicht ab, wird der Preis automatisch neu berechnet.
              </p>
            </div>
          )}

          {/* Seal */}
          <Field
            label="Sicherheitsnummer"
            htmlFor="d-seal"
            hint={currentSeal ? `Aktuell: ${currentSeal}` : 'Nummer vom Sicherheitsbeutel, falls verwendet.'}
          >
            <Input
              id="d-seal"
              value={seal}
              onChange={(e) => setSeal(e.target.value.toUpperCase())}
              placeholder="SEC-583921"
              className="font-mono text-lg"
              autoCapitalize="characters"
            />
          </Field>

          <Field label="Standort" htmlFor="d-location">
            <Input
              id="d-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Depot Frankfurt"
            />
          </Field>

          {/* Photo */}
          <div>
            <p className="field-label">
              {isDelivery ? 'Zustellnachweis (Foto)' : 'Foto'}
              <span className="ml-1 font-normal text-muted-foreground">optional</span>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => handlePhoto(e.target.files)}
            />

            {photo ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={photo.url} alt="Aufgenommenes Foto" className="h-44 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full bg-foreground/70 text-background"
                  aria-label="Foto entfernen"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                block
                className="min-h-14"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="!size-5" aria-hidden />
                Foto aufnehmen
              </Button>
            )}
          </div>

          {/* Signature */}
          {(isPickup || isDelivery) && (
            <div>
              <p className="field-label">
                Unterschrift
                <span className="ml-1 font-normal text-muted-foreground">optional</span>
              </p>
              <SignaturePad onChange={setSignature} disabled={busy} />
            </div>
          )}

          <Field label="Notiz (intern)" htmlFor="d-note">
            <Textarea
              id="d-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Empfänger war nicht da, Nachbar hat angenommen"
            />
          </Field>
        </>
      )}

      {result && (
        <Alert tone={result.ok ? 'success' : 'error'}>
          {result.ok ? (result.message ?? 'Gespeichert.') : result.error}
        </Alert>
      )}

      <Button type="submit" size="lg" block disabled={busy || !status} className="min-h-16 text-base">
        {busy ? <Loader2 className="!size-5 animate-spin" aria-hidden /> : <Check className="!size-5" aria-hidden />}
        {uploading ? 'Fotos werden hochgeladen …' : pending ? 'Wird gespeichert …' : 'Speichern'}
      </Button>
    </form>
  );
}
