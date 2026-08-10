'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CameraOff, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Field, Input } from '@/components/ui/input';
import { resolveScanToken } from '@/app/driver/actions';
import { normaliseTrackingNumber } from '@/lib/utils';
import { exampleTrackingNumber } from '@/config/brand';

/**
 * QR scanning.
 *
 * Two paths, because they cover different devices:
 *
 *  1. In-app scanner via the BarcodeDetector API (Chrome on Android, recent
 *     desktop Chrome). No library, no bundle cost.
 *  2. On everything else — notably iOS Safari, which has no BarcodeDetector —
 *     the driver uses the phone's own camera app. Our QR codes encode a normal
 *     https URL, so iOS opens it directly. That is the fastest path anyway.
 *
 * The manual field is always available as a fallback.
 */

type DetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => DetectorLike;

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof window === 'undefined') return null;
  const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return ctor ?? null;
}

/** Pulls the /scan/<token> part out of whatever the QR code contained. */
function extractToken(value: string): string | null {
  const match = value.match(/\/scan\/([a-f0-9]{16,64})/i);
  if (match) return match[1].toLowerCase();
  if (/^[a-f0-9]{16,64}$/i.test(value.trim())) return value.trim().toLowerCase();
  return null;
}

export function Scanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [pending, startTransition] = useTransition();

  /**
   * Browser-only capability check. `useSyncExternalStore` gives us `false`
   * during server rendering and the real value on the client without a
   * hydration mismatch — and without a setState-in-effect round trip.
   */
  const supported = useSyncExternalStore(
    () => () => {},
    () => !!getBarcodeDetector() && !!navigator.mediaDevices?.getUserMedia,
    () => false,
  );

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => stop, [stop]);

  const handleToken = useCallback(
    (token: string) => {
      stop();
      startTransition(async () => {
        const shipmentId = await resolveScanToken(token);
        if (shipmentId) {
          router.push(`/driver/sendung/${shipmentId}`);
        } else {
          setError('Dieser QR-Code gehört zu keiner Sendung (oder du hast keinen Zugriff darauf).');
        }
      });
    },
    [router, stop],
  );

  async function start() {
    setError(null);
    const Detector = getBarcodeDetector();
    if (!Detector) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setActive(true);

      const detector = new Detector({ formats: ['qr_code'] });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const raw = codes[0]?.rawValue;
          if (raw) {
            const token = extractToken(raw);
            if (token) {
              handleToken(token);
              return;
            }
          }
        } catch {
          // A single failed frame is normal (e.g. while focusing) — keep going.
        }
        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setError(
        'Kein Zugriff auf die Kamera. Erlaube den Kamerazugriff in den Browsereinstellungen oder nutze die Kamera-App deines Handys.',
      );
      stop();
    }
  }

  function submitManual(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const value = manual.trim();
    const token = extractToken(value);
    if (token) {
      handleToken(token);
      return;
    }

    const trackingNumber = normaliseTrackingNumber(value);
    if (/^[A-Z]{2,5}-\d{6}-\d{4,}$/.test(trackingNumber)) {
      router.push(`/driver/suche?q=${encodeURIComponent(trackingNumber)}`);
      return;
    }

    setError(`Bitte gib eine Sendungsnummer (${exampleTrackingNumber}) oder einen Scan-Link ein.`);
  }

  return (
    <div className="space-y-5">
      <div className="surface overflow-hidden">
        <div className="relative aspect-square bg-foreground/90">
          <video
            ref={videoRef}
            playsInline
            muted
            className="size-full object-cover"
            aria-label="Kamerabild"
          />
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-background">
              {pending ? (
                <Loader2 className="size-8 animate-spin" aria-hidden />
              ) : !supported ? (
                <>
                  <CameraOff className="size-8" aria-hidden />
                  <p className="text-sm leading-relaxed">
                    Dein Browser kann QR-Codes nicht direkt lesen. Nutze einfach die Kamera-App
                    deines Handys — sie öffnet den Code direkt in dieser App.
                  </p>
                </>
              ) : (
                <>
                  <ScanLine className="size-8" aria-hidden />
                  <p className="text-sm">Tippe auf „Kamera starten“ und halte den QR-Code ins Bild.</p>
                </>
              )}
            </div>
          )}
          {active && (
            <div
              className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-white/80"
              aria-hidden
            />
          )}
        </div>

        {supported && (
          <div className="p-4">
            {active ? (
              <Button variant="outline" block className="min-h-14" onClick={stop}>
                <CameraOff className="!size-5" aria-hidden />
                Kamera stoppen
              </Button>
            ) : (
              <Button block className="min-h-14" onClick={start} disabled={pending}>
                <Camera className="!size-5" aria-hidden />
                Kamera starten
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert tone="error" title="Scan nicht möglich">
          {error}
        </Alert>
      )}

      <form onSubmit={submitManual} className="surface p-4">
        <Field
          label="Oder Nummer eingeben"
          htmlFor="manual-code"
          hint="Sendungsnummer vom Label — funktioniert immer, auch ohne Kamera."
        >
          <Input
            id="manual-code"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={exampleTrackingNumber}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-lg"
          />
        </Field>
        <Button type="submit" block className="mt-3 min-h-14" variant="outline" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Sendung öffnen
        </Button>
      </form>
    </div>
  );
}
