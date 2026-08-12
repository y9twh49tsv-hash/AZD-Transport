import { Alert } from '@/components/ui/alert';
import { currentLocale } from '@/lib/i18n/server';
import { createT, DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Shared shell for the legal pages.
 *
 * Two notices sit above every one of them.
 *
 * The first is the placeholder warning: these texts are drafts written by a
 * developer, not by a lawyer, and must be replaced before the business goes
 * live.
 *
 * The second appears only when the page is *not* being read in German. The
 * business is German, the disclosures follow German law, and a translation is
 * a service to the reader — not a second binding text. Saying so plainly is
 * both the honest and the legally usual thing to do; a reader who relies on
 * the French wording of a liability clause should know which version governs
 * if the two ever disagree.
 */
export async function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const locale = await currentLocale();
  const t = createT(locale);

  return (
    <div className="container max-w-3xl py-10 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{intro}</p>}

      {locale !== DEFAULT_LOCALE && (
        <Alert tone="info" title={t('legal.translationNoticeTitle')} className="mt-6">
          {t('legal.translationNotice')}
        </Alert>
      )}

      <Alert tone="warning" title={t('legal.disclaimerTitle')} className="mt-6">
        {t('legal.disclaimer')}
      </Alert>

      <div className="mt-10 space-y-8 text-[0.9375rem] leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ms-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_strong]:text-foreground">
        {children}
      </div>

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        {t('legal.asOf', { date: t('legal.updatedAt') })}
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

/**
 * The bracketed passages that still need a lawyer's input.
 *
 * They are marked up rather than merely written in brackets so that they read
 * as an open point in every language — a reader of the Darija page should not
 * have to guess why one paragraph is in square brackets.
 */
export function Todo({ children }: { children: React.ReactNode }) {
  return <strong>{children}</strong>;
}
