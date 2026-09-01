import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { LegalPage, LegalSection } from '@/components/transfer/legal';

export const metadata: Metadata = {
  title: 'Cookies & Tracking',
  description:
    'Diese Website setzt keine Cookies, misst keine Reichweite und bindet keine Dienste Dritter ein. Was das bedeutet und warum es deshalb keine Cookie-Abfrage gibt.',
  alternates: { canonical: '/cookies' },
  robots: { index: true, follow: true },
};

/**
 * Die Cookie-Seite.
 *
 * Sie steht dort, wo Besucher „Cookie-Einstellungen" suchen — und sagt, dass
 * es nichts einzustellen gibt. Das ist kein Kunstgriff, sondern der geprüfte
 * Zustand: kein Cookie, kein localStorage, keine Anfrage an einen fremden
 * Host, nicht einmal für eine Schriftart. Die Seite nennt außerdem den Weg,
 * das selbst nachzusehen.
 *
 * ⚠ Wer hier später eine Reichweitenmessung, eine eingebettete Karte, ein
 * Chatfenster oder eine Schriftart von einem fremden Server einbaut, muss
 * diesen Text ändern und eine echte Einwilligungsabfrage ergänzen. Der Test
 * `no-cookies.test.ts` schlägt an, sobald im Quelltext etwas auftaucht, das
 * auf dem Gerät speichert.
 */
export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies & Tracking"
      intro="Kurz und vollständig: Diese Website setzt keine Cookies."
    >
      <div className="panel flex items-start gap-4 border-primary/40 bg-primary-muted/25 p-6">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-[0.95rem] leading-relaxed text-foreground">
          Keine Cookies. Keine Reichweitenmessung. Keine Werbenetzwerke. Keine Dienste Dritter, die
          Sie über Websites hinweg wiedererkennen könnten. Es wird nichts auf Ihrem Gerät
          gespeichert.
        </p>
      </div>

      <LegalSection title="Was das im Einzelnen heißt">
        <ul className="list-disc space-y-2 ps-5">
          <li>
            Keine Analysewerkzeuge — weder Google Analytics noch Matomo oder etwas Vergleichbares.
          </li>
          <li>Keine Werbe- oder Retargeting-Pixel, etwa von Meta oder Google Ads.</li>
          <li>
            Keine Schriftarten von fremden Servern. Die Seite nutzt die Schrift, die auf Ihrem Gerät
            ohnehin vorhanden ist — dadurch geht auch keine Anfrage an Google Fonts hinaus.
          </li>
          <li>Keine eingebetteten Karten, Videos oder Chatfenster.</li>
          <li>
            Auch keine technisch notwendigen Cookies: es gibt keine Anmeldung, keinen Warenkorb und
            keine Sprachumschaltung, für die etwas gemerkt werden müsste.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Warum es dann keine Cookie-Abfrage gibt">
        <p>
          <strong>§ 25 TDDDG</strong> verlangt Ihre Einwilligung, bevor Informationen auf Ihrem
          Endgerät gespeichert oder von dort ausgelesen werden. Hier wird nichts gespeichert und
          nichts ausgelesen — es gibt also nichts, worin Sie einwilligen könnten.
        </p>
        <p>
          Ein Banner, das die Erlaubnis für etwas erfragt, das gar nicht stattfindet, informiert
          niemanden. Es gewöhnt nur daran, solche Fenster ungelesen wegzuklicken. Deshalb steht hier
          keines.
        </p>
      </LegalSection>

      <LegalSection title="Was trotzdem übertragen wird">
        <p>
          Damit eine Seite überhaupt bei Ihnen ankommt, muss Ihr Browser sie anfordern. Dabei fallen
          beim Hoster Protokolldaten an: IP-Adresse, Zeitpunkt, aufgerufene Adresse, übertragene
          Datenmenge, Browser- und Betriebssystemkennung. Diese Daten dienen dem technischen Betrieb
          und der Sicherheit und werden nach spätestens 30 Tagen gelöscht oder gekürzt.
        </p>
        <p>
          Das ist kein Tracking und lässt sich technisch nicht abschalten — ohne diese Angaben
          könnte Ihnen niemand eine Seite ausliefern. Einzelheiten stehen in der{' '}
          <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Wenn Sie auf WhatsApp tippen">
        <p>
          Der WhatsApp-Knopf ist ein gewöhnlicher Link, kein eingebundenes Skript. Solange Sie ihn
          nicht antippen, besteht keine Verbindung zu Meta. Erst mit dem Antippen verlassen Sie
          diese Website, und es gelten die Datenschutzhinweise von WhatsApp. Wenn Sie das nicht
          möchten, erreichen Sie uns ebenso per Telefon, E-Mail oder über das Formular.
        </p>
      </LegalSection>

      <LegalSection title="Sie müssen uns nicht glauben">
        <p>
          Prüfen Sie es nach. Am Rechner: <strong>F12</strong> drücken, im Reiter{' '}
          <em>Anwendung</em> bzw. <em>Application</em> links auf <em>Cookies</em> klicken. Die Liste
          ist leer. Im Reiter <em>Netzwerk</em> sehen Sie außerdem, dass keine einzige Anfrage an
          einen fremden Server geht.
        </p>
      </LegalSection>

      <LegalSection title="Sollte sich das ändern">
        <p>
          Falls später eine Reichweitenmessung oder ein Dienst hinzukommt, der etwas auf Ihrem Gerät
          speichert, wird das vorher hier und in der Datenschutzerklärung beschrieben — und, soweit
          es einwilligungspflichtig ist, mit einer echten Abfrage versehen, die Ablehnen genauso
          leicht macht wie Zustimmen.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
