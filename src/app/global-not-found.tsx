import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { SiteChrome } from '@/components/transfer/root-layout';
import { content, pagePath } from '@/content';

/**
 * Die 404-Seite für Adressen, die zu keiner Route gehören.
 *
 * Bei mehreren Wurzellayouts gibt es kein gemeinsames Layout, aus dem sich
 * eine 404-Seite zusammensetzen ließe — Next verlangt hier deshalb ein
 * vollständiges HTML-Dokument. `SiteChrome` bringt genau das mit, also
 * bekommt auch diese Seite Kopfzeile, Fußzeile und die Telefonnummer.
 *
 * Ohne diese Datei zeigt Next seine eigene weiße Seite mit „404: This page
 * could not be found." Das wäre ausgerechnet die Seite, auf der jemand landet,
 * der sich vertippt hat.
 *
 * Zweisprachig, und zwar auf einer Seite: eine falsche Adresse verrät nicht,
 * welche Sprache jemand lesen wollte — `/en/impressum` ist genauso gut ein
 * englischer wie ein deutscher Vertipper. Der Weg über eine Auffangroute unter
 * `/en` wäre möglich, kostet aber das `lang`-Attribut am `<html>`: Next
 * ersetzt es, sobald `notFound()` geworfen wird. Ein Dokument ohne
 * Sprachangabe liest jeder Screenreader falsch vor.
 */
export const metadata: Metadata = {
  title: content('de').notFound.title,
  robots: { index: false, follow: false },
};

const button =
  'inline-flex min-h-12 items-center justify-center rounded-sm px-6 text-sm font-semibold';

export default function GlobalNotFound() {
  const de = content('de').notFound;
  const en = content('en').notFound;

  return (
    <SiteChrome locale="de">
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Compass className="size-6" aria-hidden />
        </span>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{de.title}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{de.text}</p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:w-auto sm:flex-row">
          <Link
            href={pagePath('request', 'de')}
            className={`${button} bg-primary text-primary-foreground`}
          >
            {de.cta}
          </Link>
          <Link
            href={pagePath('home', 'de')}
            className={`${button} border border-border font-medium text-foreground`}
          >
            {de.home}
          </Link>
        </div>

        <div className="rule mt-14 w-full max-w-sm" aria-hidden />

        {/* Dasselbe auf Englisch. `lang` am Block, damit ein Screenreader
            mitten auf der Seite die Aussprache wechselt. */}
        <div lang="en" className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">{en.title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {en.text}
          </p>
          <Link
            href={pagePath('home', 'en')}
            hrefLang="en"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {en.home}
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
