import type { Metadata } from 'next';
import { Scanner } from './scanner';

export const metadata: Metadata = { title: 'Scannen' };

export default function DriverScanPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">QR-Code scannen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scanne das Label, um die Sendung direkt zu öffnen.
        </p>
      </header>

      <Scanner />
    </div>
  );
}
