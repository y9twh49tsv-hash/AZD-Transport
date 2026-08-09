'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton({
  shipmentId,
  pieceCount,
  currentPiece,
  isInternal,
}: {
  shipmentId: string;
  pieceCount: number;
  currentPiece: number;
  isInternal: boolean;
}) {
  const router = useRouter();
  const base = `/admin/sendungen/${shipmentId}/label`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => window.print()}>
        <Printer aria-hidden />
        Drucken
      </Button>

      <Link href={`${base}?${isInternal ? '' : 'intern=1&'}von=${currentPiece}`}>
        <Button size="sm" variant="outline">
          {isInternal ? 'Kundenlabel' : 'Internes Label'}
        </Button>
      </Link>

      {pieceCount > 1 && (
        <select
          value={currentPiece}
          onChange={(event) => {
            const query = new URLSearchParams();
            if (isInternal) query.set('intern', '1');
            query.set('von', event.target.value);
            router.push(`${base}?${query.toString()}`);
          }}
          aria-label="Gepäckstück wählen"
          className="min-h-9 rounded-lg border border-input bg-card px-3 text-sm"
        >
          {Array.from({ length: pieceCount }, (_, index) => index + 1).map((piece) => (
            <option key={piece} value={piece}>
              Stück {piece}/{pieceCount}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
