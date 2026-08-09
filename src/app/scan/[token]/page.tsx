import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAdminClient } from '@/lib/supabase/admin';
import { canUseDriverApp, getSessionUser } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Scan',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Target of every QR code on a label.
 *
 * The token is unguessable and carries no data by itself — this route is the
 * only thing that can turn it into a shipment, and it does so only for a
 * signed-in driver, staff member or admin. Someone who finds a parcel and
 * scans the code sees the sign-in wall, nothing else.
 *
 * The proxy already redirects anonymous visitors to /login; the check here is
 * the authoritative one.
 */
export default async function ScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/scan/${token}`)}`);
  }

  if (!canUseDriverApp(user)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Kein Zugriff</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Dieser QR-Code kann nur von unserem Team gescannt werden. Wenn du deine eigene Sendung
          verfolgen möchtest, nutze bitte die Sendungsnummer in der Sendungsverfolgung.
        </p>
        <Link href="/tracking" className="mt-8">
          <Button>Zur Sendungsverfolgung</Button>
        </Link>
      </div>
    );
  }

  if (!/^[a-f0-9]{16,64}$/.test(token) || !isSupabaseConfigured()) {
    redirect('/driver/scan?fehler=ungueltig');
  }

  const supabase = createAdminClient();
  const { data: shipment } = await supabase
    .from('shipments')
    .select('id')
    .eq('scan_token', token)
    .maybeSingle();

  if (!shipment) {
    redirect('/driver/scan?fehler=unbekannt');
  }

  redirect(`/driver/sendung/${shipment.id}`);
}
