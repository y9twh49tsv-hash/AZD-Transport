'use client';

import { usePathname } from 'next/navigation';
import { alternatePath, content, LOCALES, type Locale } from '@/content';
import { cn } from '@/lib/utils';

/**
 * Der Sprachumschalter — als Schalter mit beiden Sprachen nebeneinander.
 *
 * Bewusst nicht ein einzelnes Wort („English"), das die jeweils andere Sprache
 * nennt. Das setzt voraus, dass jemand das Wort überhaupt als Umschalter
 * erkennt, und es zeigt nie, welche Sprache gerade läuft. **DE | EN**
 * nebeneinander, das aktuelle hervorgehoben, ist an jeder Website derselbe
 * Anblick: man muss nicht suchen und nicht raten.
 *
 * Die Reihenfolge ist fest, nicht „aktuelle zuerst" — ein Schalter, dessen
 * Hälften die Plätze tauschen, ist beim zweiten Blick ein anderer Schalter.
 *
 * Er zeigt auf das Gegenstück derselben Seite, nicht auf die Startseite der
 * anderen Sprache: wer im Impressum steht und umschaltet, will das Impressum
 * sehen. Kennt die andere Sprache die Seite nicht, führt er auf deren
 * Startseite — das ist die einzige Antwort, die nie ins Leere zeigt.
 *
 * Ein gewöhnliches `<a>` statt `<Link>`: die beiden Sprachen haben eigene
 * Wurzellayouts, dazwischen lädt Next die Seite ohnehin vollständig neu. Ein
 * `Link` würde nur so tun, als ginge es schneller.
 *
 * Als eigene Komponente, weil ihn Kopf- und Fußzeile brauchen und nur ein
 * Client-Baustein den aktuellen Pfad kennt, ohne die Seite dynamisch zu machen.
 */
export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  const t = content(locale);

  const segment =
    'inline-flex min-h-10 min-w-11 items-center justify-center rounded-[0.2rem] px-2.5 ' +
    'text-xs font-semibold uppercase tracking-[0.12em] transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-sm border border-border p-0.5',
        className,
      )}
    >
      {LOCALES.map((entry) =>
        entry === locale ? (
          /*
            Die laufende Sprache ist kein Link — sie führt nirgendwohin. Ein
            Link auf die Seite, auf der man schon steht, ist die Sorte
            Schaltfläche, nach der man zweimal tippt und sich fragt, ob etwas
            kaputt ist.
          */
          <span
            key={entry}
            aria-current="true"
            aria-label={t.localeName}
            className={cn(segment, 'bg-primary text-primary-foreground')}
          >
            {entry}
          </span>
        ) : (
          <a
            key={entry}
            href={alternatePath(pathname, entry)}
            hrefLang={entry}
            lang={entry}
            // „EN" liest ein Screenreader als zwei Buchstaben vor. Der volle
            // Name, in der Sprache, um die es geht.
            aria-label={t.switchTo}
            className={cn(segment, 'text-muted-foreground hover:bg-secondary hover:text-foreground')}
          >
            {entry}
          </a>
        ),
      )}
    </div>
  );
}
