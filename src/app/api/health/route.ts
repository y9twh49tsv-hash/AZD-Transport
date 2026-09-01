import { NextResponse } from 'next/server';
import { appUrl } from '@/config/app-url';
import { siteConfig } from '@/config/site';
import { emailConfigProblems, maskEmail } from '@/lib/notifications/email';

/**
 * Zustandsprüfung für den Container-Host (Railway `healthcheckPath`, Docker
 * HEALTHCHECK, Verfügbarkeitsüberwachung).
 *
 * Die Anwendung hat keine Datenbank mehr — es gibt also nichts, was hier
 * langsam oder kaputt sein könnte außer dem Prozess selbst. Geprüft wird
 * deshalb nur, ob er läuft und ob der E-Mail-Versand eingerichtet ist.
 *
 * Der E-Mail-Versand steht getrennt und zieht den Status nicht auf "nicht
 * bereit": fehlt er, ist die Seite vollständig benutzbar. Sichtbar muss es
 * trotzdem sein — ohne ihn kommt keine Anfrage an, und das fiele sonst erst
 * der Kundschaft auf.
 *
 * `commit` und `publicUrl` beantworten die Frage, die nach jeder Änderung an
 * den Umgebungsvariablen aufkommt: läuft im Container wirklich der Stand, den
 * ich meine, und hat er die Domain übernommen? Beides ist nicht geheim — der
 * Commit steht öffentlich im Repository, die Adresse ist die, die man
 * aufgerufen hat.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const commit =
    process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  // Benennt das Problem, statt nur "nicht konfiguriert" zu melden. Enthält nie
  // einen Schlüssel oder Teile davon — nur den Namen der Variablen und was an
  // ihr nicht stimmt.
  const emailProblems = emailConfigProblems();

  return NextResponse.json({
    status: 'ok',
    time: new Date().toISOString(),
    commit,
    publicUrl: appUrl(),
    email: {
      sending: emailProblems.length === 0,
      // Wohin eine Anfrage geht. Maskiert, weil der Endpunkt öffentlich ist.
      inbox: maskEmail(siteConfig.requestInbox),
      replyTo: process.env.EMAIL_REPLY_TO?.trim() || null,
      ...(emailProblems.length > 0 ? { problems: emailProblems } : {}),
    },
  });
}
