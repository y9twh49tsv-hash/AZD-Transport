'use client';

import { usePathname } from 'next/navigation';
import { alternatePath, content, type Locale } from '@/content';

/**
 * Der Sprachumschalter.
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
  const other: Locale = locale === 'de' ? 'en' : 'de';

  return (
    <a href={alternatePath(pathname, other)} hrefLang={other} lang={other} className={className}>
      {content(locale).switchTo}
    </a>
  );
}
