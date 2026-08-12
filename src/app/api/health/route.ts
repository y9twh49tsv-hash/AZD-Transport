import { NextResponse } from 'next/server';
import { appUrl, brand } from '@/config/brand';
import { serviceRoleProblems, supabaseConfigProblems } from '@/lib/env';
import { emailConfigProblems, maskEmail } from '@/lib/notifications/email';
import { isWhatsAppConfigured } from '@/lib/notifications/whatsapp';

/**
 * Health check for the container host (Railway `healthcheckPath`, Docker
 * HEALTHCHECK, uptime monitoring).
 *
 * Deliberately does NOT touch the database: a hiccup at Supabase must not make
 * Railway believe the app is dead and restart it in a loop. It only reports
 * whether the process is up and whether its configuration is complete.
 *
 * `commit` and `publicUrl` answer the question that comes up after every change
 * to the environment variables: is the running container actually the build I
 * think it is, and did it pick up the domain? Neither value is secret — the
 * commit is public in the repository, the URL is the address you called.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const commit =
    process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  // Benennt das Problem, statt nur "nicht konfiguriert" zu melden. Enthält nie
  // einen Schlüssel oder Teile davon — nur den Namen der Variablen und was an
  // ihr nicht stimmt.
  const problems = [...supabaseConfigProblems(), ...serviceRoleProblems()];

  // Der E-Mail-Versand steht bewusst getrennt: fehlt er, funktioniert die
  // Anwendung vollständig, nur Benachrichtigungen bleiben aus. Das darf den
  // Healthcheck nicht auf "nicht konfiguriert" ziehen, muss aber sichtbar sein
  // — ein stiller Versandfehler fällt sonst erst der Kundschaft auf.
  const emailProblems = emailConfigProblems();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || null;

  // Wohin die Meldung über eine neue Buchung geht. Beantwortet die Frage, die
  // sich nach dem Einrichten der WhatsApp Cloud API sofort stellt: kommt sie
  // jetzt aufs Handy oder immer noch nur per E-Mail? Die Adresse ist maskiert,
  // die Nummer wird nicht ausgegeben — der Endpunkt ist öffentlich.
  const alerts = {
    email: maskEmail(process.env.OPERATOR_EMAIL?.trim() || brand.email),
    whatsapp: isWhatsAppConfigured(),
    ...(isWhatsAppConfigured()
      ? {}
      : {
          hint:
            'WhatsApp-Meldungen brauchen die Meta Cloud API ' +
            '(WHATSAPP_PHONE_NUMBER_ID und WHATSAPP_ACCESS_TOKEN). ' +
            'Ein WhatsApp-Business-Konto allein genügt nicht.',
        }),
  };

  return NextResponse.json(
    {
      status: 'ok',
      configured: problems.length === 0,
      ...(problems.length > 0 && { problems }),
      email: {
        sending: emailProblems.length === 0,
        // Wohin die Antwort einer Kundin geht, wenn sie im Mailprogramm auf
        // "Antworten" tippt. Ohne EMAIL_REPLY_TO ist das die Absenderadresse —
        // und die ist bei einem reinen Versanddienst wie Resend kein Postfach.
        // Antworten gingen dann still verloren, was niemandem auffällt, bis
        // sich jemand beschwert, nie eine Antwort bekommen zu haben.
        replyTo: replyTo ? maskEmail(replyTo) : null,
        ...(emailProblems.length > 0 && { problems: emailProblems }),
      },
      alerts,
      commit: commit ? commit.slice(0, 7) : null,
      publicUrl: appUrl(),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
