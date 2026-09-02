import { AlertTriangle, Info } from 'lucide-react';
import { isTodo, todoText } from '@/config/site';
import { content, type Locale } from '@/content';
import type { LegalPageContent, LegalSectionContent } from '@/content/types';
import { RichText } from './rich-text';

/**
 * Bausteine für die Rechtsseiten.
 *
 * Der Zweck von `Value`: eine Angabe, die in der Konfiguration noch als TODO
 * steht, wird nicht gedruckt, sondern als fehlend gekennzeichnet. Eine
 * Musteradresse in einem Impressum ist keine Formalie — sie ist falsch, sie
 * ist abmahnfähig, und sie fällt niemandem mehr auf, sobald sie einmal wie
 * eine echte Adresse aussieht. Eine sichtbare Lücke fällt auf.
 */

export function Value({ children, locale }: { children: string; locale: Locale }) {
  if (!isTodo(children)) return <>{children}</>;

  return (
    <mark className="rounded-sm bg-destructive/15 px-1.5 py-0.5 text-destructive-foreground">
      <span className="sr-only">{content(locale).legal.missingPrefix}</span>
      TODO — {todoText(children)}
    </mark>
  );
}

/** Der Hinweis am Kopf einer Seite, dass noch Angaben fehlen. */
export function IncompleteNotice({ items, locale }: { items: string[]; locale: Locale }) {
  if (items.length === 0) return null;
  const t = content(locale).legal;

  return (
    <aside
      role="note"
      className="panel mt-10 border-destructive/40 bg-destructive/10 p-6"
      aria-labelledby="incomplete-title"
    >
      <div className="flex items-start gap-3.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div>
          <h2 id="incomplete-title" className="text-base font-semibold">
            {t.incompleteTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.incompleteText}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

/**
 * Der Hinweis auf den englischen Rechtsseiten: verbindlich ist die deutsche
 * Fassung. Eine übersetzte AGB übersetzt nicht die Rechtsordnung, für die sie
 * geschrieben wurde — das zu verschweigen wäre die eine Stelle, an der jemand
 * glauben könnte, etwas anderem zugestimmt zu haben.
 */
export function TranslationNotice({ locale }: { locale: Locale }) {
  const notice = content(locale).legal.translationNotice;
  if (!notice) return null;

  return (
    <aside role="note" className="panel mt-10 flex items-start gap-3.5 bg-secondary/60 p-5">
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <p className="text-sm leading-relaxed text-muted-foreground">{notice}</p>
    </aside>
  );
}

/**
 * Der Rahmen einer Rechtsseite: schmale Spalte, klare Überschriften, ruhiger
 * Zeilenabstand. Rechtstexte werden gelesen, wenn etwas schiefgeht — dann
 * zählt Lesbarkeit mehr als Gestaltung.
 */
export function LegalPage({
  title,
  intro,
  locale,
  children,
}: {
  title: string;
  intro?: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-14 lg:py-20">
      <p className="eyebrow">{content(locale).legal.eyebrow}</p>
      {/* Rechtsdeutsch besteht aus langen Komposita —
          „Allgemeine Geschäftsbedingungen“ passt bei 320 px sonst nicht in die
          Zeile und schiebt die ganze Seite seitwärts. */}
      <h1 className="mt-4 text-balance text-[clamp(1.6rem,7.5vw,1.875rem)] font-semibold leading-[1.15] tracking-tight hyphens-auto sm:text-4xl">
        {title}
      </h1>
      {intro && (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">{intro}</p>
      )}
      <TranslationNotice locale={locale} />
      <div className="mt-12 space-y-12">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[clamp(1.05rem,5.5vw,1.25rem)] font-semibold tracking-tight hyphens-auto">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_li]:leading-relaxed [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

/** Ein Abschnitt aus den Inhaltsdaten: Absätze, Liste, offener Punkt. */
export function LegalSectionFromData({ section }: { section: LegalSectionContent }) {
  return (
    <LegalSection title={section.title}>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>
          <RichText>{paragraph}</RichText>
        </p>
      ))}

      {section.list && (
        <ul className="list-disc space-y-2 ps-5">
          {section.list.map((item) => (
            <li key={item}>
              <RichText>{item}</RichText>
            </li>
          ))}
        </ul>
      )}

      {section.todo && (
        <p className="text-destructive-foreground">
          <mark className="rounded-sm bg-destructive/15 px-1.5 py-0.5">TODO — {section.todo}</mark>
        </p>
      )}
    </LegalSection>
  );
}

/**
 * Eine vollständig aus Daten gebaute Rechtsseite.
 *
 * Das Impressum kommt damit nicht aus — es druckt Werte aus der Konfiguration
 * und braucht seine eigene Komponente. Die übrigen vier sind reiner Text.
 */
export function LegalPageFromData({ page, locale }: { page: LegalPageContent; locale: Locale }) {
  return (
    <LegalPage title={page.title} intro={page.intro} locale={locale}>
      {page.sections.map((section) => (
        <LegalSectionFromData key={section.title} section={section} />
      ))}
    </LegalPage>
  );
}
