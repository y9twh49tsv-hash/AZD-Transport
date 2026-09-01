'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { whatsappRequestLink } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Die Handlungsleiste am unteren Rand — nur auf schmalen Bildschirmen.
 *
 * Auf dem Telefon ist der Daumen unten, nicht oben. Wer nach dem Lesen
 * anfragen will, soll nicht erst zurückscrollen müssen.
 *
 * Sie erscheint aber erst nach dem Kopfbereich. Direkt beim Öffnen stünde
 * sonst derselbe goldene Knopf zweimal übereinander — einmal im Kopfbereich,
 * einmal in der Leiste davor. Das sieht nach Verkaufsdruck aus, und das ist
 * genau die Wirkung, die man bei einem Fahrzeug für sechsstellige Beträge
 * nicht haben will.
 *
 * Auf der Anfrageseite bleibt sie ganz weg: dort ist das Formular die
 * Handlung, und eine Leiste, die auf dieselbe Seite zeigt, verdeckt nur
 * Eingabefelder.
 *
 * `env(safe-area-inset-bottom)` hält die Leiste über der Home-Indicator-Leiste
 * des iPhones — ohne das liegt der Knopf teilweise darunter.
 */
export function StickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname === '/anfrage') return null;

  return (
    <>
      {/* Platzhalter in der Höhe der Leiste. Er gehört hierher und nicht ins
          Layout: sonst bliebe auf der Anfrageseite, wo die Leiste ausgeblendet
          ist, eine leere Fläche unter dem Formular stehen. */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none lg:hidden',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
        // Solange die Leiste unter dem Bildschirmrand liegt, ist sie auch für
        // die Tastatur und für Screenreader nicht vorhanden — ein Knopf, den
        // man nicht sieht, darf den Fokus nicht abfangen.
        aria-hidden={!visible}
        inert={!visible}
      >
        <div className="container flex gap-2.5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Link
            href="/anfrage"
            className="flex min-h-12 flex-1 items-center justify-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Überführung anfragen
          </Link>
          <a
            href={whatsappRequestLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Anfrage über WhatsApp"
            className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-border text-foreground"
          >
            <MessageCircle className="size-5" aria-hidden />
          </a>
        </div>
      </div>
    </>
  );
}
