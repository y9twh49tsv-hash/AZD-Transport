import { AlertTriangle } from 'lucide-react';
import { isTodo, todoText } from '@/config/site';

/**
 * Bausteine für die Rechtsseiten.
 *
 * Der Zweck von `Value`: eine Angabe, die in der Konfiguration noch als TODO
 * steht, wird nicht gedruckt, sondern als fehlend gekennzeichnet. Eine
 * Musteradresse in einem Impressum ist keine Formalie — sie ist falsch, sie
 * ist abmahnfähig, und sie fällt niemandem mehr auf, sobald sie einmal wie
 * eine echte Adresse aussieht. Eine sichtbare Lücke fällt auf.
 */

export function Value({ children }: { children: string }) {
  if (!isTodo(children)) return <>{children}</>;

  return (
    <mark className="rounded-sm bg-destructive/15 px-1.5 py-0.5 text-destructive-foreground">
      <span className="sr-only">Angabe fehlt noch: </span>
      TODO — {todoText(children)}
    </mark>
  );
}

/** Der Hinweis am Kopf einer Seite, der noch Angaben fehlen. */
export function IncompleteNotice({ items }: { items: string[] }) {
  if (items.length === 0) return null;

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
            Diese Seite ist noch nicht vollständig
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Die folgenden Pflichtangaben fehlen noch und sind im Text als TODO markiert. Sie werden
            zentral in <code className="font-mono text-xs">src/config/site.ts</code> eingetragen,
            danach verschwindet dieser Hinweis von selbst.
          </p>
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
 * Der Rahmen einer Rechtsseite: schmale Spalte, klare Überschriften,
 * ruhiger Zeilenabstand. Rechtstexte werden gelesen, wenn etwas schiefgeht —
 * dann zählt Lesbarkeit mehr als Gestaltung.
 */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-14 lg:py-20">
      <p className="eyebrow">Rechtliches</p>
      {/* Rechtsdeutsch besteht aus langen Komposita —
          „Allgemeine Geschäftsbedingungen“ passt bei 320 px sonst nicht in die
          Zeile und schiebt die ganze Seite seitwärts. */}
      <h1 className="mt-4 text-balance text-[clamp(1.6rem,7.5vw,1.875rem)] font-semibold leading-[1.15] tracking-tight hyphens-auto sm:text-4xl">
        {title}
      </h1>
      {intro && (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">{intro}</p>
      )}
      <div className="mt-12 space-y-12">{children}</div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[clamp(1.05rem,5.5vw,1.25rem)] font-semibold tracking-tight hyphens-auto">{title}</h2>
      <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_li]:leading-relaxed [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
