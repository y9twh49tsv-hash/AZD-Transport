import { SiteHeader } from '@/components/transfer/site-header';
import { SiteFooter } from '@/components/transfer/site-footer';
import { StickyCta } from '@/components/transfer/sticky-cta';

/**
 * Der Rahmen der Website: Kopfzeile, Inhalt, Fußzeile und — auf dem Telefon —
 * die feste Handlungsleiste am unteren Rand.
 *
 * Die Route-Gruppe `(transfer)` taucht in keiner Adresse auf. Sie steht noch
 * da, weil dieses Layout nur für die öffentlichen Seiten gilt und nicht für
 * die Fehlerseiten, die ihren eigenen Rahmen mitbringen.
 */
export default function TransferLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
