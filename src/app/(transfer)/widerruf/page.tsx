import type { Metadata } from 'next';
import { IncompleteNotice, LegalPage, LegalSection, Value } from '@/components/transfer/legal';
import { openDetails, siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Widerrufsbelehrung',
  description:
    'Widerrufsrecht für Verbraucher bei Fernabsatzverträgen über Fahrzeugüberführungen, mit Muster-Widerrufsformular.',
  alternates: { canonical: '/widerruf' },
  robots: { index: true, follow: true },
};

export default function WiderrufPage() {
  const { address } = siteConfig;

  return (
    <LegalPage
      title="Widerrufsbelehrung"
      intro="Für Verbraucher bei Verträgen, die im Fernabsatz oder außerhalb von Geschäftsräumen geschlossen werden."
    >
      <IncompleteNotice items={openDetails()} />

      <LegalSection title="Wer dieses Recht hat">
        <p>
          Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die
          überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit
          zugerechnet werden können (§ 13 BGB). Unternehmern steht das nachfolgend beschriebene
          Widerrufsrecht nicht zu.
        </p>
      </LegalSection>

      <LegalSection title="Widerrufsrecht">
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
          widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
        </p>
        <p className="not-prose">
          <Value>{siteConfig.legalName}</Value>
          <br />
          <Value>{address.street}</Value>
          <br />
          <Value>{address.postalCode}</Value> {address.city}
          <br />
          Telefon: <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`}>{siteConfig.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine
          E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür
          das unten abgedruckte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben
          ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung
          des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
      </LegalSection>

      <LegalSection title="Folgen des Widerrufs">
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
          erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
          zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
          eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei
          der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich
          etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte
          berechnet.
        </p>
        <p>
          Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so
          haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem
          Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses
          Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang
          der im Vertrag vorgesehenen Dienstleistungen entspricht.
        </p>
      </LegalSection>

      <LegalSection title="Vorzeitiges Erlöschen des Widerrufsrechts">
        <p>
          Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von Dienstleistungen,
          wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung erst
          begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben haben und
          gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei
          vollständiger Vertragserfüllung durch uns verlieren.
        </p>
        <p>
          Das ist der praktisch häufige Fall: Wird eine Überführung auf Ihren Wunsch kurzfristig —
          also innerhalb der vierzehn Tage — durchgeführt, holen wir diese Zustimmung vor Fahrtantritt
          in Textform ein.
        </p>
      </LegalSection>

      <LegalSection title="Muster-Widerrufsformular">
        <p>
          Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden
          Sie es zurück.
        </p>

        {/* Die Ausfülllinien sind Rahmen, keine Unterstriche. Eine Reihe von
            Unterstrichen ist für den Browser ein einziges unteilbares Wort —
            auf einem schmalen Bildschirm schiebt sie die ganze Seite
            seitwärts. Ein Rahmen bricht nicht und lässt sich außerdem
            ausdrucken. */}
        <div className="panel mt-6 space-y-5 p-6 text-[0.95rem] leading-relaxed">
          <p className="break-words">
            An <Value>{siteConfig.legalName}</Value>, <Value>{address.street}</Value>,{' '}
            <Value>{address.postalCode}</Value> {address.city}, E-Mail: {siteConfig.email}
          </p>
          <p>
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die
            Erbringung der folgenden Dienstleistung:
          </p>

          {[
            'Bezeichnung der Dienstleistung',
            'Bestellt am (*) / erhalten am (*)',
            'Name des/der Verbraucher(s)',
            'Anschrift des/der Verbraucher(s)',
            'Unterschrift (nur bei Mitteilung auf Papier)',
            'Datum',
          ].map((label) => (
            <p key={label} className="border-b border-border pb-7 text-sm text-muted-foreground">
              {label}
            </p>
          ))}

          <p className="text-sm text-muted-foreground">(*) Unzutreffendes streichen.</p>
        </div>
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Diese Belehrung folgt dem gesetzlichen Muster in Anlage 1 zu Art. 246a § 1 Abs. 2 EGBGB.
          Sie ersetzt keine anwaltliche Prüfung; insbesondere die Handhabung des vorzeitigen
          Erlöschens sollte vor dem produktiven Einsatz rechtlich abgesichert werden.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
