import type { Metadata } from 'next';
import { Ban } from 'lucide-react';
import { LegalPage, Section } from '@/components/layout/legal-page';
import { prohibitedCategories } from '@/config/prohibited-items';
import { brand } from '@/config/brand';

export const metadata: Metadata = { title: 'Verbotene Waren' };

export default function ProhibitedItemsPage() {
  return (
    <LegalPage
      title="Verbotene Waren"
      intro="Diese Gegenstände dürfen wir nicht transportieren. Bitte prüfe deine Sendung vor der Abgabe."
    >
      <Section title="Nicht erlaubt">
        <ul className="!ml-0 !list-none space-y-4">
          {prohibitedCategories.map((category) => (
            <li key={category.id} className="!ml-0 rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <Ban className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
                <div className="min-w-0">
                  <h3>{category.title}</h3>
                  <p className="mt-1 text-sm">Zum Beispiel: {category.examples.join(', ')}.</p>
                  {category.note && (
                    <p className="mt-1.5 text-sm italic text-muted-foreground">{category.note}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Im Zweifel: kurz nachfragen">
        <p>
          Du bist dir bei einem Gegenstand nicht sicher? Schreib uns an {brand.email} oder ruf an
          unter {brand.phone}. Eine Minute Rückfrage ist besser als eine Sendung, die im Zoll
          hängen bleibt.
        </p>
      </Section>

      <Section title="Folgen bei Verstoß">
        <p>
          Enthält eine Sendung verbotene oder nicht deklarierte Waren, können wir die Beförderung
          verweigern. Für Schäden, Beschlagnahmen, Bußgelder oder Verzögerungen, die dadurch
          entstehen, haftet der Absender.{' '}
          <strong>
            [Genaue Rechtsfolgen und mögliche Kostenübernahme anwaltlich prüfen und hier
            konkretisieren.]
          </strong>
        </p>
      </Section>

      <Section title="Diese Liste ist nicht abschließend">
        <p>
          <strong>
            [Die endgültige Liste muss zoll- und transportrechtlich geprüft werden — insbesondere
            gegen die Einfuhrbestimmungen der marokkanischen Zollverwaltung (ADII), die deutschen
            Ausfuhrvorschriften und die ADR-Gefahrgutvorschriften. Auch die Vorgaben deiner
            Transportversicherung sind einzuarbeiten.]
          </strong>
        </p>
      </Section>
    </LegalPage>
  );
}
