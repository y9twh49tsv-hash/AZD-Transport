import { SiteHeader } from '@/components/transfer/site-header';
import { SiteFooter } from '@/components/transfer/site-footer';
import { StickyCta } from '@/components/transfer/sticky-cta';

/**
 * Der Rahmen der Überführungsseite.
 *
 * `lang` und `dir` stehen hier noch einmal, obwohl das Wurzellayout sie
 * bereits am <html>-Element setzt. Grund: dort richten sie sich nach der
 * Sprachwahl der Paketplattform, die in einem Cookie steht. Wer dort auf
 * Arabisch umgestellt hat und danach diese Seite öffnet, bekäme sonst einen
 * deutschen Text von rechts nach links gesetzt. Das nächstgelegene
 * dir-Attribut gewinnt — damit ist die Richtung hier unabhängig davon richtig.
 *
 * Das untere Polster hält Platz für die feste Handlungsleiste auf dem Telefon,
 * damit sie nicht den letzten Absatz verdeckt.
 */
export default function TransferLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="de" dir="ltr" className="theme-transfer flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
