import { Alert } from '@/components/ui/alert';

/**
 * Shared shell for the legal pages.
 *
 * Every one of them carries the same visible placeholder warning. These texts
 * are drafts written by a developer, not by a lawyer, and must be replaced
 * before the business goes live.
 */
export function LegalPage({
  title,
  intro,
  updatedAt = 'noch nicht final geprüft',
  children,
}: {
  title: string;
  intro?: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{intro}</p>}

      <Alert tone="warning" title="Platzhalter — juristisch noch nicht geprüft" className="mt-6">
        Dieser Text ist ein unverbindlicher Entwurf zur technischen Fertigstellung der Website. Er
        ersetzt keine Rechtsberatung. Vor dem echten Geschäftsbetrieb muss er von einer Anwältin
        oder einem Anwalt geprüft und an dein tatsächliches Unternehmen, deine Versicherung und die
        geltenden zoll- und transportrechtlichen Vorgaben angepasst werden.
      </Alert>

      <div className="mt-10 space-y-8 text-[0.9375rem] leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_strong]:text-foreground">
        {children}
      </div>

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        Stand: {updatedAt}
      </p>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
